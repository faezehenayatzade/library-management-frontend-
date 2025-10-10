class AuthManager {
  constructor() {
    this.tokenName = "library_token";
    this.userName = "library_user";
  }

  saveUserData(token, userData) {
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + 24 * 60 * 60 * 1000);
    document.cookie = `${this.tokenName}=${token}; expires=${expireDate.toUTCString()}; path=/`;

    localStorage.setItem(this.userName, JSON.stringify(userData));
  }

  getToken() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(this.tokenName + "=")) {
        return cookie.substring(this.tokenName.length + 1);
      }
    }
    return null;
  }

  getUserInfo() {
    const userData = localStorage.getItem(this.userName);
    return userData ? JSON.parse(userData) : null;
  }

  isUserLoggedIn() {
    return this.getToken() !== null;
  }

  logoutUser() {
    document.cookie = `${this.tokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

    localStorage.removeItem(this.userName);

    localStorage.removeItem("books_cache");

    window.location.href = "login.html";
  }

  checkPageAccess() {
    const currentPage = window.location.pathname.split("/").pop();
    const userLoggedIn = this.isUserLoggedIn();

    if (userLoggedIn) {
      if (currentPage === "login.html") {
        window.location.href = "dashboard.html";
      }
    } else {
      const protectedPages = ["dashboard.html", "books.html", "my-loans.html"];
      if (protectedPages.includes(currentPage)) {
        window.location.href = "login.html";
      }
    }
  }

  showUserInHeader() {
    const userData = this.getUserInfo();
    if (userData) {
      const userAvatar = document.getElementById("userAvatar");
      const userName = document.getElementById("userName");
      const studentName = document.getElementById("studentName");

      if (userAvatar) {
        userAvatar.textContent = userData.firstName.charAt(0);
      }
      if (userName) {
        userName.textContent = `${userData.firstName} ${userData.lastName}`;
      }
      if (studentName) {
        studentName.textContent = `${userData.firstName} ${userData.lastName}`;
      }
    }
  }
}

const authManager = new AuthManager();
