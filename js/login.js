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
      utils.showMessage("Please enter a valid email", "error");
      return;
    }

    if (password.length < 1) {
      utils.showMessage("Please enter your password", "error");
      return;
    }

    performLogin(email, password);
  });

  function performLogin(email, password) {
    utils.setButtonState(loginButton, true, "Logging in...");

    apiService
      .loginUser(email, password)
      .then((loginData) => {
        if (!loginData || !loginData.token) {
          throw new Error("Invalid response from server");
        }

        authManager.saveUserData(loginData.token, loginData.user);

        utils.showMessage("Login successful", "success");

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      })
      .catch(async (error) => {
        console.error(" Login error:", error);

        let errorMessage =
          "Login failed. Please check your email and password.";

        if (error.message.includes("401")) {
          errorMessage = "Incorrect email or password.";
        } else if (error.message.includes("404")) {
          errorMessage = "User not found.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Unable to connect to the server.";
        }

        utils.showMessage(errorMessage, "error");
      })
      .finally(() => {
        utils.setButtonState(loginButton, false);
      });
  }
});
