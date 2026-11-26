function isValidEmailFormat(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function updateLoginButtonState() {
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");
    if (!emailEl || !passwordEl || !loginBtn) return;

    const hasValidEmail = isValidEmailFormat(emailEl.value);
    const hasPassword = String(passwordEl.value || "").length > 0;
    loginBtn.disabled = !(hasValidEmail && hasPassword);
}

function updateForgotButtonState() {
    const forgotEmailEl = document.getElementById("forgotEmail");
    const forgotBtn = document.getElementById("forgotBtn");
    if (!forgotEmailEl || !forgotBtn) return;

    forgotBtn.disabled = !isValidEmailFormat(forgotEmailEl.value);
}

function clearAuthMessages() {
    const errEl = document.getElementById("error");
    const statusEl = document.getElementById("status");
    if (errEl) errEl.innerHTML = "";
    if (statusEl) statusEl.innerHTML = "";
}

function showForgotPanel() {
    clearAuthMessages();
    const loginForm = document.getElementById("loginForm");
    const forgotForm = document.getElementById("forgotForm");
    const subtitle = document.getElementById("authSubtitle");
    const emailVal = document.getElementById("email")?.value.trim() || "";
    const forgotEmailEl = document.getElementById("forgotEmail");

    if (loginForm) loginForm.classList.remove("active");
    if (forgotForm) forgotForm.classList.add("active");
    if (subtitle) subtitle.textContent = "Reset Password";
    if (forgotEmailEl && emailVal) forgotEmailEl.value = emailVal;
    updateForgotButtonState();
    if (forgotEmailEl) forgotEmailEl.focus();
}

function showLoginPanel() {
    clearAuthMessages();
    const forgotForm = document.getElementById("forgotForm");
    const loginForm = document.getElementById("loginForm");
    const subtitle = document.getElementById("authSubtitle");

    if (forgotForm) forgotForm.classList.remove("active");
    if (loginForm) loginForm.classList.add("active");
    if (subtitle) subtitle.textContent = "Administrator Login";
    updateLoginButtonState();
    document.getElementById("email")?.focus();
}

async function login() {
    updateLoginButtonState();
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn && loginBtn.disabled) return;

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");
    clearAuthMessages();

    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = "LOGGING IN...";
    }

    const { error: loginError } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        if (error) error.innerHTML = loginError.message;
        if (loginBtn) {
            loginBtn.textContent = "LOGIN";
            updateLoginButtonState();
        }
        return;
    }

    window.location.href = "/admin/";
}

async function handleLoginSubmit(event) {
    if (event) event.preventDefault();
    await login();
}

async function handleForgotSubmit(event) {
    if (event) event.preventDefault();
    updateForgotButtonState();
    const forgotBtn = document.getElementById("forgotBtn");
    if (forgotBtn && forgotBtn.disabled) return;

    const email = document.getElementById("forgotEmail").value.trim();
    const errorEl = document.getElementById("error");
    const statusEl = document.getElementById("status");
    clearAuthMessages();

    if (forgotBtn) {
        forgotBtn.disabled = true;
        forgotBtn.textContent = "SENDING...";
    }

    try {
        const redirectTo = `${window.location.origin}/admin/account-setup.html`;
        const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo
        });
        if (resetError) throw resetError;

        if (statusEl) {
            statusEl.innerHTML = `Password reset link sent to <strong>${email}</strong>. Please check your inbox.`;
        }
    } catch (err) {
        if (errorEl) {
            errorEl.innerHTML = err?.message || "Could not send password reset link.";
        }
    } finally {
        if (forgotBtn) {
            forgotBtn.textContent = "SEND RESET LINK";
            updateForgotButtonState();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");
    const forgotEmailEl = document.getElementById("forgotEmail");

    if (emailEl) {
        emailEl.addEventListener("input", () => {
            clearAuthMessages();
            updateLoginButtonState();
        });
        emailEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                updateLoginButtonState();
                if (!document.getElementById("loginBtn")?.disabled) {
                    e.preventDefault();
                    login();
                }
            }
        });
    }

    if (passwordEl) {
        passwordEl.addEventListener("input", () => {
            clearAuthMessages();
            updateLoginButtonState();
        });
        passwordEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                updateLoginButtonState();
                if (!document.getElementById("loginBtn")?.disabled) {
                    e.preventDefault();
                    login();
                }
            }
        });
    }

    if (forgotEmailEl) {
        forgotEmailEl.addEventListener("input", () => {
            clearAuthMessages();
            updateForgotButtonState();
        });
    }

    updateLoginButtonState();
    updateForgotButtonState();
});