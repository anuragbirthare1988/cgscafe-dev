async function requireAdminLogin() {
    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = "../authorization/login.html";
        return false;
    }
    return true;
}