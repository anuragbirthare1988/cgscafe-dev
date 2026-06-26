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
