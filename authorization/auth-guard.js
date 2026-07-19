async function requireAdminLogin() {
    const {
        data: {
            session
        }
    } = await defaultSupabaseClient.auth.getSession();
    if (!session) {
        window.location.href = "../authorization/login.html";
        return false;
    }
    return true;
}
