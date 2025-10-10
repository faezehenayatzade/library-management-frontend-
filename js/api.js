class ApiService {
  constructor() {
    this.baseUrl = "https://karyar-library-management-system.liara.run/api";
  }

  createHeaders(needAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (needAuth) {
      const token = authManager.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  sendRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const fullUrl = this.baseUrl + url;
      const requestOptions = {
        headers: this.createHeaders(options.needAuth !== false),
        ...options,
      };

      fetch(fullUrl, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`خطا: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data && data.success !== undefined) {
            resolve(data.data);
          } else {
            resolve(data);
          }
        })
        .catch((error) => reject(error));
    });
  }

  loginUser(email, password) {
    return this.sendRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      needAuth: false,
    });
  }

  getUserProfile() {
    return this.sendRequest("/auth/me");
  }

  getBooksList(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `/books?${queryParams}` : "/books";
    return this.sendRequest(url);
  }

  getBookDetails(bookId) {
    return this.sendRequest(`/books/${bookId}`);
  }

  getUserLoans() {
    return this.sendRequest("/loans/my-loans");
  }

  borrowBook(bookId) {
    return new Promise((resolve, reject) => {
      const token = authManager.getToken();
      if (!token) {
        reject(new Error("لطفا دوباره وارد شوید"));
        return;
      }

      const userInfo = authManager.getUserInfo();
      if (!userInfo || !userInfo.id) {
        reject(new Error("اطلاعات کاربر یافت نشد. لطفا دوباره وارد شوید"));
        return;
      }

      const fullUrl = this.baseUrl + "/loans";

      const requestBody = {
        bookId: bookId,
        userId: userInfo.id,
      };

      console.log("ارسال درخواست امانت:", requestBody);

      fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          console.log("وضعیت پاسخ:", response.status, response.statusText);

          if (!response.ok) {
            return response.text().then((text) => {
              let errorMessage = `خطای ${response.status}: ${response.statusText}`;

              try {
                const errorData = JSON.parse(text);
                errorMessage = errorData.message || errorMessage;
              } catch {
                if (text) {
                  errorMessage = `خطای ${response.status}: ${text}`;
                }
              }

              throw new Error(errorMessage);
            });
          }

          return response.json();
        })
        .then((data) => {
          console.log("پاسخ موفق امانت:", data);
          resolve(data);
        })
        .catch((error) => {
          console.error("خطا در امانت گرفتن کتاب:", error);
          reject(error);
        });
    });
  }
  returnBook(loanId) {
    return this.sendRequest(`/loans/${loanId}/return`, {
      method: "POST",
    });
  }

  getCategories() {
    return this.sendRequest("/categories");
  }
}

const apiService = new ApiService();
