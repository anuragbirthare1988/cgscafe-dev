// /admin/session.js
const ADMIN_LOGIN_URL = "/authorization/login.html";

function getAdminSupabaseClient() {
  return window.supabaseClient || (typeof supabaseClient !== "undefined" ? supabaseClient : null);
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

async function requireLogin() {
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

  // Session confirmed: reveal page content
  setAdminAuthCloak(false);

  // Keep every /admin/* view guarded if session expires or is signed out elsewhere
  client.auth.onAuthStateChange((_event, nextSession) => {
    if (!nextSession && window.location.pathname.startsWith("/admin/")) {
      setAdminAuthCloak(true);
      window.location.replace(ADMIN_LOGIN_URL);
    }
  });

  return true;
}

async function logout({ clearStorage = true } = {}) {
  const client = getAdminSupabaseClient();
  if (client?.auth) {
    await client.auth.signOut();
  }
  if (clearStorage) {
    localStorage.clear();
    sessionStorage.clear();
  }
  window.location.replace(ADMIN_LOGIN_URL);
}

async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  return true;
}

// Auto-enforce on any page under /admin/ once DOM is ready
if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin/")) {
  const runGlobalAdminGuard = () => {
    requireLogin();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runGlobalAdminGuard, { once: true });
  } else {
    runGlobalAdminGuard();
  }
}