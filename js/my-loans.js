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
        console.error("Error fetching loans:", error);
        utils.showMessage("Failed to load loans", "error");
      });
  }

  function displayLoans(loans) {
    const loansTable = document.querySelector(".table tbody");
    if (!loansTable) return;

    if (loans.length === 0) {
      loansTable.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #666;">
            No active loans
          </td>
        </tr>`;
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
      <tr data-loan-id="${loan.id}">
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
        const row = this.closest("tr");
        const loanId = row.getAttribute("data-loan-id");
        returnBook(loanId, row, this);
      });
    });
  }

  function returnBook(loanId, rowElement, buttonElement) {
    utils.setButtonState(buttonElement, true, "Returning...");

    apiService
      .returnBook(loanId)
      .then(() => {
        utils.showMessage("Book returned successfully", "success");

        const statusSpan = rowElement.querySelector(".status");
        statusSpan.textContent = "Returned";
        statusSpan.className = "status status-returned";

        buttonElement.textContent = "Returned";
        buttonElement.disabled = true;
        buttonElement.classList.remove("btn-success");
        buttonElement.classList.add("btn-secondary");

        apiService.getUserLoans().then(updateLoanStats);
      })
      .catch((error) => {
        console.error("Error returning book:", error);
        utils.showMessage("Failed to return book", "error");
        utils.setButtonState(buttonElement, false);
      });
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
