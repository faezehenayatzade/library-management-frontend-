document.addEventListener("DOMContentLoaded", function () {
  authManager.checkPageAccess();

  authManager.showUserInHeader();

  loadUserLoans();

  setupLogoutButton();

  function loadUserLoans() {
    apiService
      .getUserLoans()
      .then((loansData) => {
        displayLoans(loansData);
        updateLoanStats(loansData);
      })
      .catch((error) => {
        console.error("خطا در دریافت امانت‌ها:", error);
        utils.showMessage("خطا در بارگذاری امانت‌ها", "error");
      });
  }

  function displayLoans(loans) {
    const loansTable = document.querySelector(".table tbody");
    if (!loansTable) return;

    if (loans.length === 0) {
      loansTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #666;">
                        هیچ امانت فعالی ندارید
                    </td>
                </tr>
            `;
      return;
    }

    loansTable.innerHTML = loans.map((loan) => createLoanRow(loan)).join("");

    setupReturnButtons();
  }

  function createLoanRow(loan) {
    const statusClass = getStatusClass(loan.status);
    const statusText = getStatusText(loan.status);
    const canReturn = loan.status === "active";

    return `
            <tr>
                <td>
                    <strong>${loan.book.title}</strong>
                    <br>
                    <small style="color: #666;">ISBN: ${loan.book.isbn}</small>
                </td>
                <td>${loan.book.author}</td>
                <td>${utils.formatDate(loan.loanDate)}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-success btn-sm return-btn" 
                            data-loan-id="${loan.id}" 
                            ${!canReturn ? "disabled" : ""}>
                        ${canReturn ? "Return" : "Returned"}
                    </button>
                </td>
            </tr>
        `;
  }

  function updateLoanStats(loans) {
    const activeLoans = loans.filter((loan) => loan.status === "active").length;
    const returnedLoans = loans.filter(
      (loan) => loan.status === "returned",
    ).length;

    const statNumbers = document.querySelectorAll(".stat-number");
    if (statNumbers.length >= 2) {
      statNumbers[0].textContent = activeLoans;
      statNumbers[1].textContent = returnedLoans;
    }

    const totalSpan = document.querySelector(".card-header span");
    if (totalSpan) {
      totalSpan.textContent = `Total: ${loans.length} loans`;
    }
  }

  function getStatusClass(status) {
    const statusMap = {
      active: "status-active",
      returned: "status-returned",
      lost: "status-overdue",
    };
    return statusMap[status] || "status-active";
  }

  function getStatusText(status) {
    const statusMap = {
      active: "Active",
      returned: "Returned",
      lost: "Lost",
    };
    return statusMap[status] || "Active";
  }

  function setupReturnButtons() {
    const returnButtons = document.querySelectorAll(
      ".return-btn:not([disabled])",
    );
    returnButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const loanId = this.getAttribute("data-loan-id");
        returnBook(loanId, this);
      });
    });
  }

  function returnBook(loanId, buttonElement) {
    utils.setButtonState(buttonElement, true, "Returning...");

    apiService
      .returnBook(loanId)
      .then((returnData) => {
        utils.showMessage("کتاب با موفقیت بازگردانده شد!", "success");

        loadUserLoans();
      })
      .catch((error) => {
        console.error("خطا در بازگرداندن کتاب:", error);
        utils.showMessage("خطا در بازگرداندن کتاب", "error");
        utils.setButtonState(buttonElement, false);
      });
  }

  function setupLogoutButton() {
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();

        const confirmLogout = confirm(
          "آیا مطمئن هستید که می‌خواهید خارج شوید؟",
        );
        if (confirmLogout) {
          authManager.logoutUser();
        }
      });
    });
  }
});
