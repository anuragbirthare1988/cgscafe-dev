// /admin/session.js
const ADMIN_LOGIN_URL = "/authorization/login.html";

function getAdminSupabaseClient() {
  return window.supabaseClient || (typeof supabaseClient !== "undefined" ? supabaseClient : null);
}

function isAccountSetupPage() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.replace(/\/+$/, "").endsWith("/admin/account-setup.html");
}

function isAdminRoute() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === "/admin" || path.startsWith("/admin/") || path.endsWith("/pos.html");
}

function setAdminAuthCloak(isPending) {
  if (typeof document === "undefined" || !document.body) return;
  document.body.classList.toggle("admin-auth-pending", Boolean(isPending));
}

async function getCurrentUser() {
  const client = getAdminSupabaseClient();
  if (!client?.auth) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}

async function logout({ clearStorage = true } = {}) {
  const client = getAdminSupabaseClient();
  if (client?.auth) {
    try {
      await client.auth.signOut();
    } catch (_) {}
  }
  if (clearStorage) {
    localStorage.clear();
    sessionStorage.clear();
  }
  window.location.replace(ADMIN_LOGIN_URL);
}

async function requireLogin() {
  if (isAccountSetupPage()) {
    setAdminAuthCloak(false);
    return true;
  }

  setAdminAuthCloak(true);

  const client = getAdminSupabaseClient();
  if (!client?.auth) {
    window.location.replace(ADMIN_LOGIN_URL);
    return false;
  }

  const { data: { session }, error } = await client.auth.getSession();
  if (error || !session) {
    window.location.replace(ADMIN_LOGIN_URL);
    return false;
  }

  setAdminAuthCloak(false);

  client.auth.onAuthStateChange((_event, nextSession) => {
    if (!nextSession && isAdminRoute() && !isAccountSetupPage()) {
      setAdminAuthCloak(true);
      window.location.replace(ADMIN_LOGIN_URL);
    }
  });

  return true;
}

async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  return true;
}

if (
  typeof window !== "undefined" &&
  isAdminRoute() &&
  !isAccountSetupPage()
) {
  const runGlobalAdminGuard = () => {
    requireLogin();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runGlobalAdminGuard, { once: true });
  } else {
    runGlobalAdminGuard();
  }
}