document.addEventListener("DOMContentLoaded", function () {
  authManager.checkPageAccess();

  authManager.showUserInHeader();

  loadDashboardData();

  setupLogoutButton();

  function loadDashboardData() {
    Promise.all([
      apiService.getUserProfile(),
      apiService.getUserLoans(),
      apiService.getBooksList(),
    ])
      .then(([userData, loansData, booksData]) => {
        updateDashboardStats(userData, loansData, booksData);
      })
      .catch((error) => {
        utils.showMessage("Failed to load dashboard data", "error");
      });
  }

  function updateDashboardStats(userData, loansData, booksData) {
    const activeLoans = loansData.filter(
      (loan) => loan.status === "active",
    ).length;

    const availableBooks = booksData.filter(
      (book) => book.availableCopies > 0,
    ).length;

    const activeLoansElement = document.getElementById("activeLoans");
    const availableBooksElement = document.getElementById("availableBooks");

    if (activeLoansElement) {
      activeLoansElement.textContent = activeLoans;
    }
    if (availableBooksElement) {
      availableBooksElement.textContent = availableBooks;
    }
  }

  function setupLogoutButton() {
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();

        const confirmLogout = confirm("Are you sure you want to logout?");
        if (confirmLogout) {
          authManager.logoutUser();
        }
      });
    });
  }
});
