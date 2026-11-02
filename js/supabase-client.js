// PeriodWise Supabase Configuration

const SUPABASE_URL = "https://cqghljmnufxtgifetirl.supabase.co/rest/v1/";
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
