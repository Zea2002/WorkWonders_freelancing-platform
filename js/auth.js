
function isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
}

async function renderAuthLinks() {
    const authLinksContainer = document.getElementById('auth-links');
    const postJobButton = document.getElementById('post-job-button'); 
    if (isAuthenticated()) {
        const userType = localStorage.getItem('userType'); 

        // Render links based on user type
        authLinksContainer.innerHTML = `
          <ul class="navbar-nav ml-auto d-flex align-items-center">
    <li class="nav-item">
        <a href="${userType === 'client' ? 'client-dashboard.html' : 'freelancer-dashboard.html'}" class="nav-link">Profile</a>
    </li>
    <li class="nav-item">
        <a href="#" class="nav-link" onclick="logout()">Logout</a>
    </li>
</ul>

        `;

        // Show or hide the Post Job button based on user type
        if (userType === 'client') {
            postJobButton.style.display = 'block'; 
        } else {
            postJobButton.style.display = 'none';  
        }
    } else {
        authLinksContainer.innerHTML = `
          <ul class="navbar-nav ml-auto d-flex align-items-center">
    <li class="nav-item">
        <a href="login.html" class="nav-link">Login</a>
    </li>
    <li class="nav-item">
        <a href="register.html" class="nav-link">Sign Up</a>
    </li>
</ul>

        `;
        postJobButton.style.display = 'none'; 
    }
}

async function logout() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('You are not logged in.');
        return;
    }

    try {
        const response = await fetch('https://freelancer-platform-api-17pq.onrender.com/user/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            alert('Logout successful');
            localStorage.clear();
            window.location.reload(); 
        } else {
            const errorData = await response.json();
            alert('Logout Error: ' + (errorData.detail || 'An error occurred'));
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}


document.addEventListener('DOMContentLoaded', renderAuthLinks);


// category
$(document).ready(function () {
    const apiUrl = 'https://freelancer-platform-api-17pq.onrender.com/projects/category/';

    $.ajax({
        url: apiUrl,
        method: 'GET',
        success: function (data) {
           
            displayCategories(data.results);
        },
        error: function (error) {
            console.error('Error fetching categories:', error);
        }
    });

    function displayCategories(categories) {
        const container = $('#category-container');
        container.empty(); 

        categories.forEach(category => {
            const card = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${category.name}</h5>
                            <p class="card-text">Explore projects related to ${category.name}.</p>
                            <a href="projects.html?category=${category.name}" class="btn btn-primary">View Projects</a>
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });
    }
});
