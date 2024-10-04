// Add event listener for form submission
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Gather form data
    const formData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value, // Added email field
        password: document.getElementById('password').value, // Correct password ID
        confirm_password: document.getElementById('confirmPassword').value, // Correct confirm password ID
        user_type: document.getElementById('userType').value // Correct user type ID
    };

    // Check if passwords match
    if (formData.password !== formData.confirm_password) {
        document.getElementById('message').innerText = 'Passwords do not match!';
        return; // Stop form submission if passwords don't match
    }

    // Send a POST request to the API
    fetch('https://freelancer-platform-api-17pq.onrender.com/user/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail || 'Registration failed'); // Handle specific error messages
            });
        }
        return response.json();
    })
    .then(data => {
        // Handle success
        document.getElementById('message').innerText = 'Registration successful! Please check your email for verification.';
        document.getElementById('register-form').reset(); // Reset the form
    })
    .catch(error => {
        // Handle error
        document.getElementById('message').innerText = 'Registration failed: ' + error.message;
    });
});
