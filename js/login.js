document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();  // Prevent the form from submitting traditionally

        // Get username and password values from the form
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Make an API request to login
            const response = await fetch('https://freelancer-platform-api-17pq.onrender.com/user/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,  // Send username
                    password: password,  // Send password
                }),
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('message').style.color = 'green';
                document.getElementById('message').textContent = "Login successful!";

                // Store the token and user type in localStorage for future requests
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userType', data.user_type); // Store user type
                localStorage.setItem('user_id', data.user_id); // Store user type
                localStorage.setItem('user_name', data.username); // Store user name

                // Redirect to appropriate page based on user type
                if (data.user_type === 'client') {
                    window.location.href = 'client-dashboard.html';  // Redirect clients to their dashboard
                } else {
                    window.location.href = 'freelancer-dashboard.html';  // Redirect freelancers to their dashboard
                }

                console.log('Login successful:', data);
                console.log('Token:', data.token);
            } else {
                const errorData = await response.json();
                console.log('Login failed:', errorData);
                document.getElementById('message').textContent = errorData.error || 'Login failed. Please check your credentials.';
                document.getElementById('message').style.color = 'red'; // Set error message color to red
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('message').textContent = 'An error occurred. Please try again later.';
            document.getElementById('message').style.color = 'red'; // Set error message color to red
        }

        // Check user type and display the "Post Job" button if the user is a client
        displayPostJobButton();
    });

    // Function to display the "Post Job" button if the user is a client
    function displayPostJobButton() {
        const userType = localStorage.getItem('userType');  // Get user type from localStorage
        const postJobButton = document.getElementById('post-job-button');

        if (userType === 'client') {
            postJobButton.style.display = 'block';  // Show button if user is a client
        } else {
            postJobButton.style.display = 'none';   // Hide button if user is not a client
        }
    }

    // Call the function on page load to check if user is logged in and display the button accordingly
    displayPostJobButton();
});
