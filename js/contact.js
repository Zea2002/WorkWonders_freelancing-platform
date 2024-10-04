document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");

    form.addEventListener("submit", function (event) {
        event.preventDefault();  

        // Validate the form
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add("was-validated");
        } else {
            // Get form data
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const subject = document.getElementById("subject").value;
            const message = document.getElementById("message").value;

            
            const contactData = {
                name: name,
                email: email,
                subject: subject,
                message: message
            };

            // Send the data to the API using the Fetch API
            fetch("https://freelancer-platform-api-17pq.onrender.com/contact/contact/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(contactData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.detail || "Error submitting the contact form");
                    });
                }
                return response.json();
            })
            .then(data => {
                alert("Your message has been sent successfully!");
                form.reset();  
                form.classList.remove("was-validated");  
            })
            .catch(error => {
                console.error("Error:", error);
                alert("There was an issue submitting your message. Please try again.");
            });
        }
    });
});
