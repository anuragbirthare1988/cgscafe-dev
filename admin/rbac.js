// Shared RBAC & Permission Loader for CGS Admin & POS
window.CGS_PERMISSIONS = [
  { key: "pos_access", label: "Access POS Screen", group: "Core POS" },
  { key: "take_order", label: "Add / Modify Table Items", group: "Core POS" },
  { key: "send_kot", label: "Send & Reprint KOT", group: "Core POS" },
  { key: "settle_bill", label: "Settle & Close Bills", group: "Core POS" },
  { key: "reprint_receipt", label: "Reprint Receipts & Send WA", group: "Core POS" },
  { key: "waive_off", label: "Waive-Off Bill / Items", group: "Sensitive Actions" },
  { key: "refund", label: "Issue Refund", group: "Sensitive Actions" },
  { key: "replace", label: "Replace Settled Items", group: "Sensitive Actions" },
  { key: "edit_billing_rules", label: "Edit Taxes, Service Charge & UPI", group: "Admin & Controls" },
  { key: "view_analytics", label: "View Sales Analytics & Reports", group: "Admin & Controls" },
  { key: "manage_users", label: "Manage Staff Users & Roles", group: "Admin & Controls" }
];

window.CGS_ROLE_PRESETS = {
  cashier: {
    pos_access: true, take_order: true, send_kot: true, settle_bill: true, reprint_receipt: true,
    waive_off: false, refund: false, replace: false,
    edit_billing_rules: false, view_analytics: false, manage_users: false
  },
  captain: {
    pos_access: true, take_order: true, send_kot: true, settle_bill: true, reprint_receipt: true,
    waive_off: false, refund: false, replace: true,
    edit_billing_rules: false, view_analytics: false, manage_users: false
  },
  manager: {
    pos_access: true, take_order: true, send_kot: true, settle_bill: true, reprint_receipt: true,
    waive_off: true, refund: true, replace: true,
    edit_billing_rules: true, view_analytics: true, manage_users: false
  },
  superuser: {
    pos_access: true, take_order: true, send_kot: true, settle_bill: true, reprint_receipt: true,
    waive_off: true, refund: true, replace: true,
    edit_billing_rules: true, view_analytics: true, manage_users: true
  }
};

window.loadCurrentStaffProfile = async function () {
  const client = window.supabaseClient || (typeof supabaseClient !== "undefined" ? supabaseClient : null);
  if (!client?.auth) return null;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await client
    .from("staff_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    // Fallback if staff_profiles table isn't migrated yet
    window.currentStaffProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      role: "superuser",
      is_active: true,
      permissions: { ...window.CGS_ROLE_PRESETS.superuser }
    };
    return window.currentStaffProfile;
  }

  window.currentStaffProfile = profile;
  return profile;
};

window.canStaff = function (permKey) {
  const p = window.currentStaffProfile;
  if (!p || p.is_active === false) return false;
  if (p.role === "superuser") return true;
  return Boolean(p.permissions && p.permissions[permKey]);
};
