document.addEventListener("DOMContentLoaded", function () {
  authManager.checkPageAccess();
  authManager.showUserInHeader();

  const booksGrid = document.querySelector(".grid.grid-3");

  const alertContainer = document.createElement("div");
  alertContainer.id = "alert-container";
  alertContainer.style.marginBottom = "1rem";
  booksGrid.parentElement.insertBefore(alertContainer, booksGrid);

  const modal = document.createElement("div");
  modal.id = "book-details-modal";
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "9999";
  modal.innerHTML = `
    <div id="modalBox" style="background:white; padding:2rem; border-radius:12px; width:90%; max-width:500px; box-shadow:0 0 15px rgba(0,0,0,0.3); position:relative;">
      <div id="modalContent" style="text-align:left;"></div>
      <div style="text-align:center; margin-top:1.5rem;">
        <button id="closeModalBtn" class="btn btn-secondary">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", function (e) {
    if (!e.target.closest("#modalBox")) {
      modal.style.display = "none";
    }
  });

  document
    .getElementById("closeModalBtn")
    .addEventListener("click", function () {
      modal.style.display = "none";
    });

  loadBooks();

  setupLogoutButton();

  function loadBooks() {
    const cached = cacheManager.getBooksFromCache();
    if (cached) {
      console.log(" Using cached books");
      renderBooks(cached);
      return;
    }

    console.log(" Fetching books from API...");
    apiService
      .getBooksList()
      .then(function (books) {
        cacheManager.saveBooksToCache(books);
        console.log("books:", books);
        renderBooks(books);
      })
      .catch(function (error) {
        console.error(" Failed to load books:", error);
        utils.showMessage("Error loading book list.", "error");
      });
  }

  function renderBooks(books) {
    console.log(books);
    if (!books || books.length === 0) {
      booksGrid.innerHTML = `<p>No books found.</p>`;
      return;
    }

    const cardsHTML = books.map((book) => utils.createBookCard(book)).join("");
    booksGrid.innerHTML = cardsHTML;

    setupBorrowButtons();
    setupDetailsButtons(books);
  }

  function setupBorrowButtons() {
    const borrowButtons = document.querySelectorAll(".borrow-btn");

    borrowButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const bookId = btn.getAttribute("data-book-id");
        const originalText = btn.textContent;

        utils.setButtonState(btn, true, "Borrowing...");

        apiService
          .borrowBook(bookId)
          .then(function () {
            utils.showMessage(" Book borrowed successfully.", "success");
            cacheManager.clearBooksCache();
            loadBooks();
          })
          .catch(function (error) {
            console.error(" Borrow failed:", error);
            utils.showMessage(
              error.message || "Error borrowing book.",
              "error",
            );
          })
          .finally(function () {
            utils.setButtonState(btn, false, originalText);
          });
      });
    });
  }

  function setupDetailsButtons(books) {
    const detailButtons = document.querySelectorAll(".view-details-btn");

    detailButtons.forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();

        const bookId = btn.getAttribute("data-book-id");
        console.log(" Book details:", bookId);

        apiService
          .getBookDetails(bookId)
          .then(function (book) {
            showBookDetails(book);
          })
          .catch(function (error) {
            console.warn(" API error, trying cache:", error);

            const cachedBooks = cacheManager.getBooksFromCache() || [];
            const found = cachedBooks.find(
              (b) => b.id == bookId || b._id == bookId,
            );
            if (found) {
              showBookDetails(found);
            } else {
              utils.showMessage("Error displaying book details.", "error");
            }
          });
      });
    });
  }

  function showBookDetails(book) {
    const modalContent = document.getElementById("modalContent");

    let categoryName = "Uncategorized";
    if (book.category.name) {
      categoryName =
        typeof book.category === "string"
          ? book.category
          : book.category.name || "Uncategorized";
    }

    modalContent.innerHTML = `
    <h2 class="mb-2">${book.title}</h2>
    <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
    <p><strong>ISBN:</strong> ${book.isbn || "-"}</p>
    <p><strong>Category:</strong> ${categoryName}</p>
    <p><strong>Available Copies:</strong> ${book.availableCopies || 0}</p>
    <hr class="mb-2 mt-2">
    <p><strong>Description:</strong></p>
    <p>${book.description || "No description provided."}</p>
  `;

    modal.style.display = "flex";
  }

  function setupLogoutButton() {
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (confirmLogout) {
          authManager.logoutUser();
        }
      });
    });
  }
});
