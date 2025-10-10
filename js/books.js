document.addEventListener("DOMContentLoaded", function () {
  authManager.checkPageAccess();

  authManager.showUserInHeader();

  loadBooks();

  setupLogoutButton();

  function loadBooks() {
    const booksContainer = document.querySelector(".grid.grid-3");
    if (!booksContainer) return;

    booksContainer.innerHTML =
      '<div class="card">در حال بارگذاری کتاب‌ها...</div>';

    console.log("دریافت کتاب‌ها از API...");

    apiService
      .getBooksList()
      .then((booksData) => {
        console.log("داده‌های دریافتی:", booksData);

        if (booksData && booksData.length > 0) {
          displayBooks(booksData);
        } else {
          booksContainer.innerHTML =
            '<div class="card">هیچ کتابی یافت نشد</div>';
        }
      })
      .catch((error) => {
        console.error("خطا در دریافت کتاب‌ها:", error);
        booksContainer.innerHTML =
          '<div class="card alert-error">خطا در بارگذاری کتاب‌ها</div>';
      });
  }

  function displayBooks(books) {
    const booksContainer = document.querySelector(".grid.grid-3");
    if (!booksContainer) return;

    console.log("نمایش کتاب‌ها:", books.length, "کتاب");

    booksContainer.innerHTML = books
      .map((book) => createBookCard(book))
      .join("");

    setupBookButtons();
  }

  function createBookCard(book) {
    const isAvailable = book.available && book.availableCopies > 0;

    return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: #2c3e50;">${book.title}</h3>
                    <span class="status ${isAvailable ? "status-available" : "status-unavailable"}">
                        ${isAvailable ? "موجود" : "ناموجود"}
                    </span>
                </div>
                <p style="color: #666; margin-bottom: 0.5rem;"><strong>نویسنده:</strong> ${book.author}</p>
                <p style="color: #666; margin-bottom: 0.5rem;"><strong>شابک:</strong> ${book.isbn}</p>
                <p style="color: #666; margin-bottom: 0.5rem;"><strong>دسته‌بندی:</strong> ${book.category?.name || "بدون دسته"}</p>
                <p style="color: #666; margin-bottom: 1rem;"><strong>تعداد موجود:</strong> ${book.availableCopies}</p>
                <p style="margin-bottom: 1rem; font-size: 0.9rem; color: #555;">${book.description || "توضیحاتی موجود نیست."}</p>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-sm borrow-btn" 
                            data-book-id="${book.id}" 
                            ${!isAvailable ? "disabled" : ""}>
                        ${isAvailable ? "امانت گرفتن" : "ناموجود"}
                    </button>
                    <button class="btn btn-secondary btn-sm view-details-btn" data-book-id="${book.id}">
                        مشاهده جزئیات
                    </button>
                </div>
            </div>
        `;
  }

  function setupBookButtons() {
    const borrowButtons = document.querySelectorAll(".borrow-btn");
    borrowButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const bookId = this.getAttribute("data-book-id");
        borrowBook(bookId, this);
      });
    });

    const detailButtons = document.querySelectorAll(".view-details-btn");
    detailButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const bookId = this.getAttribute("data-book-id");
        viewBookDetails(bookId);
      });
    });
  }

  function borrowBook(bookId, buttonElement) {
    const originalText = buttonElement.textContent;
    buttonElement.textContent = "در حال امانت...";
    buttonElement.disabled = true;

    console.log("شروع امانت گرفتن کتاب با ID:", bookId);

    apiService
      .borrowBook(bookId)
      .then((response) => {
        console.log("پاسخ کامل امانت:", response);

        if (response.message && response.message.includes("successfully")) {
          alert("✅ " + response.message);
          setTimeout(() => {
            loadBooks();
          }, 1000);
        } else if (response.loan) {
          alert("✅ کتاب با موفقیت امانت گرفته شد!");
          setTimeout(() => {
            loadBooks();
          }, 1000);
        } else {
          alert("📖 امانت ثبت شد");
          setTimeout(() => {
            loadBooks();
          }, 1000);
        }
      })
      .catch((error) => {
        console.error("خطای کامل در امانت گرفتن:", error);

        if (
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        ) {
          alert("❌ لطفا دوباره وارد سیستم شوید");
          authManager.logoutUser();
        } else if (
          error.message.includes("404") ||
          error.message.includes("not found")
        ) {
          alert("❌ کتاب مورد نظر یافت نشد");
        } else if (
          error.message.includes("400") ||
          error.message.includes("Bad request")
        ) {
          alert("❌ درخواست نامعتبر. لطفا مجدد تلاش کنید");
        } else if (
          error.message.includes("403") ||
          error.message.includes("Forbidden")
        ) {
          alert("❌ دسترسی غیرمجاز");
        } else {
          alert("❌ خطا در امانت گرفتن کتاب: " + error.message);
        }

        buttonElement.textContent = originalText;
        buttonElement.disabled = false;
      });
  }

  function viewBookDetails(bookId) {
    apiService
      .getBookDetails(bookId)
      .then((bookData) => {
        alert(
          `جزئیات کتاب:\n\n` +
            `عنوان: ${bookData.title}\n` +
            `نویسنده: ${bookData.author}\n` +
            `دسته‌بندی: ${bookData.category?.name || "بدون دسته"}\n` +
            `تعداد موجود: ${bookData.availableCopies}\n\n` +
            `${bookData.description || "بدون توضیحات"}`,
        );
      })
      .catch((error) => {
        console.error("خطا در دریافت جزئیات کتاب:", error);
        alert("خطا در دریافت جزئیات کتاب");
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
