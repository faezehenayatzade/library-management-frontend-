function createApiService() {
  const baseUrl = "https://karyar-library-management-system.liara.run/api";

  function createHeaders(needAuth = true) {
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

  function sendRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const fullUrl = baseUrl + url;
      const requestOptions = {
        headers: createHeaders(options.needAuth !== false),
        ...options,
      };

      fetch(fullUrl, requestOptions)
        .then((response) => {
          if (response.status === 401) {
            authManager.logoutUser();
            throw new Error("Unauthorized");
          }

          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
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

  function loginUser(email, password) {
    return sendRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      needAuth: false,
    });
  }

  function getUserProfile() {
    return sendRequest("/auth/me");
  }

  function getBooksList(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `/books?${queryParams}` : "/books";
    return sendRequest(url);
  }

  function getBookDetails(bookId) {
    return sendRequest(`/books/${bookId}`);
  }

  function getUserLoans() {
    return sendRequest("/loans/my-loans");
  }

  function borrowBook(bookId) {
    return new Promise((resolve, reject) => {
      const token = authManager.getToken();
      if (!token) {
        authManager.logoutUser();
        reject(new Error("Please log in again"));
        return;
      }

      const userInfo = authManager.getUserInfo();
      if (!userInfo || !userInfo.id) {
        authManager.logoutUser();
        reject(new Error("User info not found. Please log in again"));
        return;
      }

      const fullUrl = baseUrl + "/loans";
      const requestBody = { bookId, userId: userInfo.id };

      fetch(fullUrl, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          if (response.status === 401) {
            authManager.logoutUser();
            throw new Error("Unauthorized");
          }

          if (!response.ok) {
            return response.text().then((text) => {
              let errorMessage = `Error ${response.status}: ${response.statusText}`;
              try {
                const errorData = JSON.parse(text);
                errorMessage = errorData.message || errorMessage;
              } catch {}
              throw new Error(errorMessage);
            });
          }

          return response.json();
        })
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  function returnBook(loanId) {
    return sendRequest(`/loans/${loanId}/return`, {
      method: "POST",
    });
  }

  function getCategories() {
    return sendRequest("/categories");
  }

  return {
    loginUser,
    getUserProfile,
    getBooksList,
    getBookDetails,
    getUserLoans,
    borrowBook,
    returnBook,
    getCategories,
    sendRequest, 
  };
}

const apiService = createApiService();
