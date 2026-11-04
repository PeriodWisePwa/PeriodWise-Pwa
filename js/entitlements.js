// ==========================================
// PERIODWISE PREMIUM ACCESS CHECKER
// ==========================================

window.PeriodWiseEntitlements = {

    PRODUCT_CODE: "ttc_hub_lifetime",

    // Check whether the customer has purchased TTC Hub
    async checkTtcHubAccess() {

        try {

            const supabase = window.periodWiseSupabase;

            if (!supabase) {
                throw new Error("Database connection is unavailable.");
            }

            // Check the customer's login session
            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();

            if (sessionError) {
                throw sessionError;
            }

            const session = sessionData.session;

            // Customer must be signed in
            if (!session) {

                return {
                    signedIn: false,
                    hasAccess: false,
                    message: "Please sign in to continue."
                };

            }

            // Check verified purchase entitlement
            const { data, error } = await supabase
                .from("user_entitlements")
                .select("product_code, status")
                .eq("user_id", session.user.id)
                .eq("product_code", this.PRODUCT_CODE)
                .eq("status", "active")
                .limit(1);

            if (error) {
                throw error;
            }

            // Return customer's access status
            if (data && data.length > 0) {

                return {
                    signedIn: true,
                    hasAccess: true,
                    message: "Premium TTC access confirmed."
                };

            }

            return {
                signedIn: true,
                hasAccess: false,
                message: "No active TTC Hub purchase was found."
            };

        } catch (error) {

            console.error(
                "PeriodWise entitlement check failed:",
                error
            );

            return {
                signedIn: false,
                hasAccess: false,
                error: true,
                message: "Unable to verify premium access. Please try again."
            };

        }

    }

};

console.log("PeriodWise premium access checker loaded.");
