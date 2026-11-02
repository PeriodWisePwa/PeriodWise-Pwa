// ==========================================
// PERIODWISE CUSTOMER AUTHENTICATION
// ==========================================

window.PeriodWiseAuth = {

    // Customer registration
    async signUp(email, password) {

        const { data, error } =
            await window.periodWiseSupabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo:
                        "https://app.periodwise.online"
                }
            });

        if (error) {
            throw error;
        }

        return data;
    },

    // Customer login
    async signIn(email, password) {

        const { data, error } =
            await window.periodWiseSupabase.auth
                .signInWithPassword({
                    email: email,
                    password: password
                });

        if (error) {
            throw error;
        }

        return data;
    },

    // Customer logout
    async signOut() {

        const { error } =
            await window.periodWiseSupabase.auth.signOut();

        if (error) {
            throw error;
        }

        return true;
    },

    // Password recovery
    async resetPassword(email) {

        const { error } =
            await window.periodWiseSupabase.auth
                .resetPasswordForEmail(email, {
                    redirectTo:
                        "https://app.periodwise.online"
                });

        if (error) {
            throw error;
        }

        return true;
    },

    // Get current customer session
    async getSession() {

        const { data, error } =
            await window.periodWiseSupabase.auth
                .getSession();

        if (error) {
            throw error;
        }

        return data.session;
    },

    // Listen for login and logout changes
    onAuthChange(callback) {

        return window.periodWiseSupabase.auth
            .onAuthStateChange((event, session) => {
                callback(event, session);
            });
    }

};

console.log("PeriodWise authentication module loaded.");
