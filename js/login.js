document.addEventListener("DOMContentLoaded", function () {
  authManager.checkPageAccess();

  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = loginForm.querySelector('button[type="submit"]');

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!utils.isValidEmail(email)) {
      utils.showMessage("لطفا یک ایمیل معتبر وارد کنید", "error");
      return;
    }

    if (password.length < 1) {
      utils.showMessage("لطفا رمز عبور خود را وارد کنید", "error");
      return;
    }

    performLogin(email, password);
  });

  function performLogin(email, password) {
    utils.setButtonState(loginButton, true, "Logging in...");

    apiService
      .loginUser(email, password)
      .then((loginData) => {
        authManager.saveUserData(loginData.token, loginData.user);

        utils.showMessage("ورود موفقیت‌آمیز بود!", "success");

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      })
      .catch((error) => {
        console.error("خطا در ورود:", error);
        utils.showMessage(
          "ورود ناموفق بود. لطفا اطلاعات خود را بررسی کنید.",
          "error",
        );
      })
      .finally(() => {
        utils.setButtonState(loginButton, false);
      });
  }
});
