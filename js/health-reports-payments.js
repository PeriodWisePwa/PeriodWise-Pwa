
// PeriodWise Health Reports Payments
// Connects Health Reports purchase buttons to Dodo checkout.
// Checks subscription access before allowing report generation or printing.

(function () {
    "use strict";

    const PRODUCT_CODES = {
        cycle: "cycle_reports_annual",
        fertility: "fertility_reports_annual",
        ttc: "ttc_health_reports_annual"
    };

    const PURCHASE_BUTTONS = {
        cycleReportButton: PRODUCT_CODES.cycle,
        fertilityReportButton: PRODUCT_CODES.fertility,
        ttcHealthReportButton: PRODUCT_CODES.ttc
    };

    const REPORT_BUTTONS = {
        generateCycleReportButton: PRODUCT_CODES.cycle,
        printCycleReportButton: PRODUCT_CODES.cycle,

        generateFertilityReportButton: PRODUCT_CODES.fertility,
        printFertilityReportButton: PRODUCT_CODES.fertility,

        generateTtcHealthReportButton: PRODUCT_CODES.ttc,
        printTtcHealthReportButton: PRODUCT_CODES.ttc
    };

    const supabase = () => window.periodWiseSupabase;

    async function getCurrentUser() {
        if (!supabase()) {
            throw new Error("PeriodWise Supabase is not initialized.");
        }

        const { data, error } = await supabase().auth.getUser();

        if (error || !data.user) {
            throw new Error("Please sign in to continue.");
        }

        return data.user;
    }

    async function getActiveSubscriptions() {
        const user = await getCurrentUser();

        const { data, error } = await supabase()
            .from("health_report_subscriptions")
            .select("product_code, status, current_period_end")
            .eq("user_id", user.id);

        if (error) {
            console.error("Health Reports access check:", error);
            throw new Error("Unable to check your report access. Please try again.");
        }

        const now = Date.now();

        return (data || []).filter(subscription => {
            if (subscription.status !== "active") {
                return false;
            }

            if (!subscription.current_period_end) {
                return true;
            }

            return new Date(subscription.current_period_end).getTime() > now;
        });
    }

    function hasAccess(subscriptions, requiredProduct) {
        const activeProducts = subscriptions.map(item => item.product_code);

        if (activeProducts.includes(PRODUCT_CODES.ttc)) {
            return true;
        }

        if (requiredProduct === PRODUCT_CODES.ttc) {
            return false;
        }

        if (requiredProduct === PRODUCT_CODES.fertility) {
            return activeProducts.includes(PRODUCT_CODES.fertility);
        }

        if (requiredProduct === PRODUCT_CODES.cycle) {
            return (
                activeProducts.includes(PRODUCT_CODES.fertility) ||
                activeProducts.includes(PRODUCT_CODES.cycle)
            );
        }

        return false;
    }

    async function startCheckout(button, productCode) {
        if (button.disabled) return;

        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = "Preparing checkout...";

        try {
            await getCurrentUser();

            const { data, error } = await supabase().functions.invoke(
                "health-reports-checkout",
                {
                    body: {
                        product_code: productCode
                    }
                }
            );

            if (error) {
                console.error("Checkout error:", error);
                throw new Error("Unable to start checkout. Please try again.");
            }

            if (!data || !data.success || !data.checkout_url) {
                throw new Error(
                    data?.error || "The checkout link could not be created."
                );
            }

            window.location.href = data.checkout_url;

        } catch (error) {
            console.error("Health Reports checkout:", error);
            alert(error.message || "Something went wrong. Please try again.");

            button.disabled = false;
            button.textContent = originalText;
        }
    }

    Object.entries(PURCHASE_BUTTONS).forEach(([buttonId, productCode]) => {
        const button = document.getElementById(buttonId);

        if (!button) return;

        button.addEventListener("click", function () {
            startCheckout(button, productCode);
        });
    });

    // Protect report generation and printing.
    // If access is confirmed, replay the original click so the
    // existing health-reports.js handlers can continue normally.

    document.addEventListener("click", async function (event) {
        const target = event.target;

        if (!target || typeof target.closest !== "function") return;

        const button = target.closest("button");

        if (!button) return;

        if (event.healthReportsAccessVerified) return;

        const requiredProduct = REPORT_BUTTONS[button.id];

        if (!requiredProduct) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        if (button.dataset.checkingAccess === "true") return;

        button.dataset.checkingAccess = "true";

        try {
            const subscriptions = await getActiveSubscriptions();

            if (!hasAccess(subscriptions, requiredProduct)) {
                alert(
                    "An active Health Reports purchase is required to generate or print this report. Please unlock the appropriate report package first."
                );
                return;
            }

            const replay = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
            });

            replay.healthReportsAccessVerified = true;
            button.dispatchEvent(replay);

        } catch (error) {
            console.error("Report access check:", error);
            alert(error.message || "Unable to verify report access.");
        } finally {
            delete button.dataset.checkingAccess;
        }
    }, true);

    console.log("PeriodWise Health Reports Payments loaded.");
})();
