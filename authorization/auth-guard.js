// /authorization/auth-guard.js
async function requireAdminLogin() {
  if (typeof requireLogin === "function") {
    return await requireLogin();
  }
  const client = window.supabaseClient || (typeof supabaseClient !== "undefined" ? supabaseClient : null);
  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    window.location.replace("/authorization/login.html");
    return false;
  }
  return true;
}