document.addEventListener("DOMContentLoaded", function () {
  let categoriesMap = {};  // Store a map of category name to category ID

  // Fetch categories for the dropdown
  fetch("https://freelancer-platform-api-17pq.onrender.com/projects/category/")
    .then(response => response.json())
    .then(data => {
      const result = data.results;
      console.log("Categories:", result);
      const categorySelect = document.getElementById("category");

      // Populate the category dropdown and map categories by name
      result.forEach(category => {
        const option = document.createElement("option");
        option.value = category.name;  // Use the category name as the option value
        option.text = category.name;   // Display the category name in the dropdown
        categorySelect.appendChild(option);

        // Map category name to category ID for later use if necessary
        categoriesMap[category.name] = category.id;
      });
    })
    .catch(error => console.error("Error fetching categories:", error));

  // Bootstrap form validation
  const form = document.getElementById("new-project-form");
  form.addEventListener("submit", function (event) {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add("was-validated");
    } else {
      event.preventDefault();  // Prevent actual form submission

      const title = document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const budget = document.getElementById("budget").value;
      const deadline = document.getElementById("deadline").value;
      const categoryName = document.getElementById("category").value;  // Get category name
      const attachment = document.getElementById("attachment").files[0];

      // Retrieve the user ID from localStorage
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("User ID not found in local storage");
        return;
      }

      // Fetch user information
      fetch(`https://freelancer-platform-api-17pq.onrender.com/user/users/${userId}/`)
        .then(response => response.json())
        .then(userData => {
          const client = userData.username;

          // Create form data for the project
          const formData = new FormData();
          formData.append("title", title);
          formData.append("description", description);
          formData.append("budget", budget);
          formData.append("deadline", deadline);
          formData.append("category", categoryName);  // Send category name, not ID
          formData.append("client", client);
          if (attachment) {
            formData.append("attachment", attachment);  // Post file as attachment
          }

          // POST request to create the project
          fetch("https://freelancer-platform-api-17pq.onrender.com/projects/projects/", {
            method: "POST",
            body: formData,
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          })
          .then(response => {
            if (!response.ok) {
              return response.json().then(errorData => {
                throw new Error(errorData.detail || "Error creating project");
              });
            }
            return response.json();
          })
          .then(data => {
            alert("Project created successfully!");

            // Redirect to the home page after success
            window.location.href = "index.html";  // Update this to your actual home page URL
          })
          .catch(error => console.error("Error:", error));
        })
        .catch(error => console.error("Error fetching user data:", error));
    }
  });
});
