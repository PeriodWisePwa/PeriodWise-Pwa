// PeriodWise Supabase Configuration

const SUPABASE_URL = "https://cqghljmnufxtgifetirl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_8L_vcm4y69cWxE2D7f4MMQ__e9hIEzt";

window.periodWiseSupabase = null;

function initializePeriodWiseSupabase() {
    if (!window.supabase) {
        console.error("Supabase library has not loaded.");
        return;
    }

    window.periodWiseSupabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    console.log("PeriodWise Supabase connected.");
}

window.testPeriodWiseConnection = async function () {
    try {
        const { data, error } = await window.periodWiseSupabase
            .from("user_entitlements")
            .select("id")
            .limit(1);

        if (error) {
            console.error("Connection test:", error.message);
            return "Database response: " + error.message;
        }

        return "PeriodWise database connection successful!";
    } catch (error) {
        return "Connection failed: " + error.message;
    }
};
