class Utils {
  showMessage(message, type = "info", containerId = "alert-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    container.innerHTML = "";
    container.appendChild(alertDiv);

    if (type !== "error") {
      setTimeout(() => {
        alertDiv.remove();
      }, 5000);
    }
  }

  setButtonState(button, isLoading, loadingText = "Loading...") {
    const textSpan = button.querySelector("#loginText");
    const spinnerSpan = button.querySelector("#loginSpinner");

    if (textSpan && spinnerSpan) {
      if (isLoading) {
        textSpan.textContent = loadingText;
        spinnerSpan.classList.remove("hidden");
        button.disabled = true;
      } else {
        textSpan.textContent = "Login";
        spinnerSpan.classList.add("hidden");
        button.disabled = false;
      }
    } else {
      button.disabled = isLoading;
      button.textContent = isLoading
        ? loadingText
        : button.getAttribute("data-original-text") || "Submit";
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  createBookCard(book) {
    const isAvailable = book.availableCopies > 0;

    return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: #2c3e50;">${book.title}</h3>
                    <span class="status ${isAvailable ? "status-available" : "status-unavailable"}">
                        ${isAvailable ? "Available" : "Unavailable"}
                    </span>
                </div>
                <p style="color: #666; margin-bottom: 0.5rem;"><strong>Author:</strong> ${book.author}</p>
                <p style="color: #666; margin-bottom: 0.5rem;"><strong>ISBN:</strong> ${book.isbn}</p>
                <p style="color: #666; margin-bottom: 0.5rem;"><strong>Category:</strong> ${book.category.name}</p>
                <p style="color: #666; margin-bottom: 1rem;"><strong>Available Copies:</strong> ${book.availableCopies}</p>
                <p style="margin-bottom: 1rem; font-size: 0.9rem; color: #555;">${book.description || "No description available."}</p>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-sm borrow-btn" 
                            data-book-id="${book.id}" 
                            ${!isAvailable ? "disabled" : ""}>
                        ${isAvailable ? "Borrow Book" : "Not Available"}
                    </button>
                    <button class="btn btn-secondary btn-sm view-details-btn" data-book-id="${book.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
  }
}

const utils = new Utils();
