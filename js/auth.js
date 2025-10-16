function createAuthManager() {
  const TOKEN_KEY = "library_token";
  const USER_KEY = "library_user";
  const CACHE_KEY = "books_cache";
  const PROTECTED_PAGES = ["dashboard.html", "books.html", "my-loans.html"];

  function saveUserData(token, userData) {
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + 24 * 60 * 60 * 1000); 

    document.cookie =
      TOKEN_KEY + "=" + token +
      "; expires=" + expireDate.toUTCString() +
      "; path=/";

    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  function getToken() {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      if (cookie.indexOf(TOKEN_KEY + "=") === 0) {
        return cookie.substring(TOKEN_KEY.length + 1);
      }
    }
    return null;
  }

  function getUserInfo() {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading user data:", error);
      return null;
    }
  }

  function isUserLoggedIn() {
    return getToken() !== null;
  }

  function logoutUser() {
    document.cookie =
      TOKEN_KEY + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CACHE_KEY);
    window.location.href = "login.html";
  }

  function checkPageAccess() {
    const parts = window.location.pathname.split("/");
    const currentPage = parts[parts.length - 1];
    const loggedIn = isUserLoggedIn();

    if (loggedIn && currentPage === "login.html") {
      window.location.href = "dashboard.html";
      return;
    }

    if (!loggedIn && PROTECTED_PAGES.indexOf(currentPage) !== -1) {
      window.location.href = "login.html";
    }
  }

  function showUserInHeader() {
    const user = getUserInfo();
    if (!user) return;

    const avatarEl = document.getElementById("userAvatar");
    const nameEl = document.getElementById("userName");
    const studentNameEl = document.getElementById("studentName");

    const firstName = user.firstName ? user.firstName : "";
    const lastName = user.lastName ? user.lastName : "";
    const fullName = (firstName + " " + lastName).trim();

    if (avatarEl) {
      avatarEl.textContent = firstName.length > 0
        ? firstName.charAt(0).toUpperCase()
        : "?";
    }

    if (nameEl) {
      nameEl.textContent = fullName;
    }

    if (studentNameEl) {
      studentNameEl.textContent = fullName;
    }
  }

  return {
    saveUserData,
    getToken,
    getUserInfo,
    isUserLoggedIn,
    logoutUser,
    checkPageAccess,
    showUserInHeader
  };
}

const authManager = createAuthManager();
