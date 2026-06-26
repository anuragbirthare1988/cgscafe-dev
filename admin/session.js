// admin/session.js
async function getCurrentUser() {
    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();
    return user;
}
async function requireLogin() {
    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.replace("/authorization/login.html");
        return false;
    }
    return true;
}
async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/authorization/login.html";
}
async function isAdmin() {
    const user = await getCurrentUser();
    if (!user) return false;
    // Later we'll add role checks here.
    return true;
}
