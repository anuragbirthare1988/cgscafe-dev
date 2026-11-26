import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizePhone(raw: unknown): string {
  return String(raw || "").replace(/\D/g, "").slice(0, 10);
}

function isValidIndianMobile(digits: string): boolean {
  return /^[6-9]\d{9}$/.test(digits);
}

async function findAuthUserByEmail(
  adminClient: ReturnType<typeof createClient>,
  email: string
) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) return null;

    const match = data.users.find(
      (u) => String(u.email || "").trim().toLowerCase() === email
    );
    if (match) return match;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !caller) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is an active admin / superuser / staff manager
    const { data: callerProfile } = await adminClient
      .from("staff_profiles")
      .select("role, is_active, permissions")
      .eq("id", caller.id)
      .maybeSingle();

    const callerRole = String(callerProfile?.role || "").toLowerCase();
    const canManageStaff =
      callerProfile?.is_active === true &&
      (["admin", "owner", "superuser"].includes(callerRole) ||
        Boolean(callerProfile?.permissions?.manage_users) ||
        Boolean(callerProfile?.permissions?.manage_staff_users));

    if (!canManageStaff) {
      return jsonResponse({ error: "Forbidden: Insufficient permissions to manage staff." }, 403);
    }

    const body = await req.json();
    const action = String(body.action || "invite").trim().toLowerCase();
    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.full_name || "").trim().toUpperCase();
    const phone = normalizePhone(body.phone);
    const normalizedRole = String(body.role || "cashier").trim().toLowerCase();
    const permissions = typeof body.permissions === "object" && body.permissions !== null
      ? body.permissions
      : {};
    const redirectTo = String(body.redirect_to || "");
    const isActive = body.is_active !== false;

    // 1. Delete / revoke pending invite or existing user account
    if (action === "delete" || action === "revoke") {
      let targetUserId = body.user_id || null;

      if (!targetUserId && email) {
        const existingUser = await findAuthUserByEmail(adminClient, email);
        targetUserId = existingUser?.id ?? null;
      }

      if (!targetUserId && !email) {
        return jsonResponse({ error: "user_id or email is required to delete." }, 400);
      }

      if (
        (targetUserId && targetUserId === caller.id) ||
        (email && caller.email && email === caller.email.trim().toLowerCase())
      ) {
        return jsonResponse({ error: "You cannot delete your own currently logged-in account." }, 400);
      }

      if (targetUserId) {
        const { error: delAuthErr } = await adminClient.auth.admin.deleteUser(targetUserId);
        if (delAuthErr) {
          return jsonResponse({ error: delAuthErr.message }, 400);
        }
        const { error: delProfileErr } = await adminClient
          .from("staff_profiles")
          .delete()
          .eq("id", targetUserId);
        if (delProfileErr) {
          return jsonResponse({ error: delProfileErr.message }, 400);
        }
      } else if (email) {
        const { error: delByEmailErr } = await adminClient
          .from("staff_profiles")
          .delete()
          .ilike("email", email);
        if (delByEmailErr) {
          return jsonResponse({ error: delByEmailErr.message }, 400);
        }
      }

      return jsonResponse({
        ok: true,
        deleted_user_id: targetUserId,
        message: `Deleted user ${email || targetUserId}.`,
      }, 200);
    }

    // 2. Validate required fields for invite / resend
    if (!email || !fullName || !isValidIndianMobile(phone)) {
      return jsonResponse(
        { error: "Full name, valid email, and a valid 10-digit mobile number are required." },
        400
      );
    }

    // 3. CREATE / INVITE FLOW: Check DB first—do not create or overwrite if user already exists
    if (action === "invite") {
      const { data: existingRows, error: lookupErr } = await adminClient
        .from("staff_profiles")
        .select("id, email, role, full_name")
        .ilike("email", email)
        .limit(1);

      if (lookupErr) {
        return jsonResponse({ error: lookupErr.message }, 400);
      }

      const existingProfile = Array.isArray(existingRows) && existingRows.length > 0
        ? existingRows[0]
        : null;
      const existingAuthUser = existingProfile ? null : await findAuthUserByEmail(adminClient, email);

      if (existingProfile || existingAuthUser) {
        const existingRole = existingProfile?.role || "existing";
        return jsonResponse(
          {
            error: `User with email ${email} already exists (${existingRole}). Creation is blocked—use Edit Roles on the existing user instead.`,
            code: "USER_ALREADY_EXISTS",
          },
          409
        );
      }

      const metadata = {
        full_name: fullName,
        phone,
        role: normalizedRole,
      };

      const { data: inviteData, error: inviteErr } =
        await adminClient.auth.admin.inviteUserByEmail(email, {
          data: metadata,
          redirectTo: redirectTo || undefined,
        });

      if (inviteErr || !inviteData?.user) {
        return jsonResponse(
          { error: inviteErr?.message || "Failed to send account invite." },
          400
        );
      }

      const targetUserId = inviteData.user.id;
      const { error: insertErr } = await adminClient.from("staff_profiles").insert({
        id: targetUserId,
        email,
        full_name: fullName,
        phone,
        role: normalizedRole,
        permissions,
        is_active: isActive,
        invite_status: "invited",
        updated_at: new Date().toISOString(),
      });

      if (insertErr) {
        return jsonResponse({ error: insertErr.message }, 400);
      }

      return jsonResponse(
        {
          ok: true,
          user_id: targetUserId,
          role: normalizedRole,
          invite_status: "invited",
          invite_sent: true,
          message: `Invite email sent to ${email}! They can now set their password.`,
        },
        200
      );
    }

    // 4. RESEND INVITE FLOW: Send invite if unconfirmed, or recovery/reset email if already confirmed
    if (action === "resend") {
      let targetUserId = body.user_id || null;
      let existingUser = null;

      if (targetUserId) {
        const { data: userRes } = await adminClient.auth.admin.getUserById(targetUserId);
        existingUser = userRes?.user ?? null;
      }
      if (!existingUser && email) {
        existingUser = await findAuthUserByEmail(adminClient, email);
        targetUserId = existingUser?.id ?? targetUserId;
      }

      if (!existingUser) {
        return jsonResponse({ error: "No auth user found to resend invite for." }, 404);
      }

      const metadata = {
        full_name: fullName,
        phone,
        role: normalizedRole,
      };

      await adminClient.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...(existingUser.user_metadata || {}),
          ...metadata,
        },
      });

      const alreadyConfirmed = Boolean(
        existingUser.email_confirmed_at || existingUser.last_sign_in_at
      );

      let inviteSent = false;
      let statusMessage = "";

      if (!alreadyConfirmed) {
        const { error: resendErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
          data: metadata,
          redirectTo: redirectTo || undefined,
        });
        if (resendErr) {
          return jsonResponse({ error: resendErr.message }, 400);
        }
        inviteSent = true;
        statusMessage = `Invite email re-sent to ${email}.`;
      } else {
        const { error: resetErr } = await adminClient.auth.resetPasswordForEmail(
          email,
          redirectTo ? { redirectTo } : undefined
        );
        if (resetErr) {
          return jsonResponse({ error: resetErr.message }, 400);
        }
        inviteSent = true;
        statusMessage = `${email} is already confirmed—sent a password/access reset email instead.`;
      }

      const { data: existingProfile } = await adminClient
        .from("staff_profiles")
        .select("invite_status")
        .eq("id", existingUser.id)
        .maybeSingle();

      const finalInviteStatus =
        existingProfile?.invite_status === "active" || alreadyConfirmed ? "active" : "invited";

      const { error: updateProfileErr } = await adminClient
        .from("staff_profiles")
        .update({
          full_name: fullName,
          phone,
          role: normalizedRole,
          permissions,
          is_active: isActive,
          invite_status: finalInviteStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id);

      if (updateProfileErr) {
        return jsonResponse({ error: updateProfileErr.message }, 400);
      }

      return jsonResponse(
        {
          ok: true,
          user_id: existingUser.id,
          role: normalizedRole,
          invite_status: finalInviteStatus,
          invite_sent: inviteSent,
          message: statusMessage,
        },
        200
      );
    }

    return jsonResponse({ error: `Unsupported action: ${action}` }, 400);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});