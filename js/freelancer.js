const baseURL = 'https://freelancer-platform-api-17pq.onrender.com';


const loadUserProfile = async () => {
    
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('user_name');

    if (!userId) {
        console.error('User ID not found in localStorage');
        return;
    }

    try {
        
        const userResponse = await fetch(`${baseURL}/user/users/${userId}/`);
        const userData = await userResponse.json();

       
        console.log('User Data:', userData);

        if (!userData.username) {
            console.error('Username not found in user data');
            return;
        }
        const fullName = `${userData.first_name} ${userData.last_name}`;

       
        const profileResponse = await fetch(`${baseURL}/user/freelancers/?username=${username}`);
        const profileData = await profileResponse.json();
        const freelancer_id=profileData.results[0].id;
        fetchProposals(freelancer_id);
        fetchReviews(freelancer_id);

       
        console.log('Profile Data:', profileData);

       
        if (profileData.results.length > 0) {
            displayUserProfile(profileData.results[0], fullName);
        } else {
            console.error('No profile data found for this user');
        }

    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
};

// Function to display the user profile in the DOM
const displayUserProfile = (user, fullName) => {
    const profileContainer = document.getElementById('freelancer-profile');
    
    if (user) {
        profileContainer.innerHTML = `
            <div class="card shadow">
                <div class="card-body">
                    <img src="${user.profile_pic}" class="card-img-top mb-3" alt="Profile Picture" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;">
                    <h5 class="card-title">Full Name: ${fullName}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Username: ${user.username}</h6>
                    <p class="card-text">${user.bio || 'No bio available.'}</p>
                    <p><strong>Location:</strong> ${user.location || 'Unknown'}</p>
                    <p><strong>Phone:</strong> ${user.phone}</p>
                    <p><strong>Portfolio:</strong> ${user.url}</p>
                    <p><strong>Balance:</strong> $${user.balance || 0}</p>
                    <p><strong>Verified:</strong> ${user.is_verified ? 'Yes' : 'No'}</p>
                    <p><strong>Skills:</strong> ${user.skill && user.skill.length > 0 ? user.skill.join(', ') : 'No skills listed'}</p>
                </div>
            </div>
        `;
    } else {
        profileContainer.innerHTML = `<p class="text-center text-danger">Profile not found</p>`;
    }
};

// Example of opening a modal for profile update (you can add more functionality here)
const openUpdateModal = (bio, location) => {
    alert(`Bio: ${bio}, Location: ${location}`);
};

// Initialize the user profile on page load
document.addEventListener('DOMContentLoaded', loadUserProfile);



// apply job history
async function fetchProposals(freelancer_id) {
    try {
        const response = await fetch(`https://freelancer-platform-api-17pq.onrender.com/proposals/proposals/?freelancer_id=${freelancer_id}`);
        const data = await response.json();
        populateTable(data.results);
    } catch (error) {
        console.error("Error fetching proposals:", error);
    }
}

// Populate the table with fetched proposals
function populateTable(proposals) {
    const jobHistoryBody = document.getElementById("job-history-body");
    jobHistoryBody.innerHTML = ""; // Clear any existing rows

    proposals.forEach(proposal => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${proposal.project}</td>
            <td class="${getProposalStatusClass(proposal.proposal_status)}">${proposal.proposal_status}</td>
            <td>${proposal.about_on_project}</td>
            <td>${proposal.time}</td>
            <td>${proposal.proposed_price}</td>
            <td>
                ${proposal.proposal_status !== "Completed" ? 
                    `<span class="cancel-btn" onclick="cancelProposal(${proposal.id})">Cancel</span>` : 
                    "N/A"
                }
            </td>
        `;
        jobHistoryBody.appendChild(row);
    });
}

// Get the appropriate class for the proposal status
function getProposalStatusClass(status) {
    switch (status) {
        case 'completed':
            return 'status-completed';
        case 'pending':
            return 'status-pending';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return '';
    }
}

// Function to cancel a proposal
async function cancelProposal(proposalId) {
    const confirmation = confirm("Are you sure you want to cancel this proposal?");
    if (confirmation) {
        try {
            const response = await fetch(`https://freelancer-platform-api-17pq.onrender.com/proposals/proposals/${proposalId}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert("Proposal cancelled successfully.");
                fetchProposals(); // Refresh the table
            } else {
                alert("Failed to cancel the proposal.");
            }
        } catch (error) {
            console.error("Error cancelling proposal:", error);
        }
    }
}


// Initial fetch of proposals when the page loads
window.onload = fetchProposals;

// Function to fetch available skills and populate the dropdown
const loadSkills = async () => {
    try {
        const skillsResponse = await fetch(`${baseURL}/user/skills/`);
        const skillsData = await skillsResponse.json();
              console.log("skill", skillsData);
        // Populate the dropdown with skills
        const skillsDropdown = document.getElementById('skills');
        skillsData.results.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill.id;
            option.textContent = skill.name;
            skillsDropdown.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching skills:', error);
    }
};

// Function to display the profile creation form
const displayProfileForm = () => {
    const formContainer = document.getElementById('freelancer-profile');
    formContainer.innerHTML = `
        <form id="freelancer-profile-form" enctype="multipart/form-data">
            <div class="form-group">
                <label for="skills">Skills</label>
                <select class="form-control" id="skills" multiple required>
                    <option value="" disabled>Select your skills</option>
                </select>
            </div>
            <div class="form-group">
                <label for="profile_pic">Profile Picture</label>
                <input type="file" class="form-control" id="profile_pic" required>
            </div>
            <div class="form-group">
                <label for="portfolio_url">Portfolio URL</label>
                <input type="url" class="form-control" id="portfolio_url" placeholder="Enter your portfolio link">
            </div>
            <div class="form-group">
                <label for="phone">Phone</label>
                <input type="text" class="form-control" id="phone" placeholder="Enter your phone number" required>
            </div>
            <div class="form-group">
                <label for="bio">Bio</label>
                <textarea class="form-control" id="bio" placeholder="Enter a short bio" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label for="location">Location</label>
                <input type="text" class="form-control" id="location" placeholder="Enter your location" required>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Create Profile</button>
        </form>
    `;

    // Add event listener for form submission
    document.getElementById('freelancer-profile-form').addEventListener('submit', handleProfileSubmit);

    // Load skills into the dropdown
    loadSkills();
};

// Function to handle profile form submission
const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const userId = localStorage.getItem('user_id');
    if (!userId) {
        console.error('User ID not found in localStorage');
        return;
    }

    // Collect form data
    const username = localStorage.getItem('user_name');
    console.log('username for cretae profile:', username);
    const formData = new FormData();
    formData.append('user', username);
    formData.append('profile_pic', document.getElementById('profile_pic').files[0]);
    formData.append('portfolio_url', document.getElementById('portfolio_url').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('bio', document.getElementById('bio').value);
    formData.append('location', document.getElementById('location').value);

    // Collect selected skills (multiple)
    const selectedSkills = Array.from(document.getElementById('skills').selectedOptions).map(option => option.value);
    selectedSkills.forEach(skillId => formData.append('skills', skillId));

    // Send the POST request to create a new freelancer profile
    try {
        const response = await fetch(`${baseURL}/user/freelancers/`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert('Profile created successfully.');
            loadUserProfile(); // Reload the profile after creation
        } else {
            const errorData = await response.json();
            console.error('Error creating profile:', errorData);
            alert('Failed to create profile.');
        }
    } catch (error) {
        console.error('Error submitting profile form:', error);
    }
};
document.addEventListener('DOMContentLoaded', function () {
    const noProfileExists = true; 

    if (noProfileExists) {
        displayProfileForm(); 
    }
});

// reviews
function fetchReviews(freelancerId) {
    fetch(`${apiReviewsUrl}?freelancer=${freelancerId}`)
        .then(response => response.json())
        .then(data => {
            const reviews = data.results;  
            const reviewsContainer = document.getElementById('freelancer-reviews');
            const averageRatingElem = document.getElementById('freelancer-average-rating');
            
            if (reviews.length === 0) {
                reviewsContainer.innerHTML = '<p>No reviews available.</p>';
                averageRatingElem.innerHTML = 'N/A';
                return;
            }
            
            const totalRating = reviews.reduce((acc, review) => {
                const ratingValue = parseInt(review.rating.replace(/[^0-9]/g, '')); 
                return acc + ratingValue;
            }, 0);
            
            const averageRating = (totalRating / reviews.length).toFixed(1);
            averageRatingElem.innerHTML = renderStars(averageRating); // Render stars

            reviewsContainer.innerHTML = reviews.map(review => `
                <div class="review">
                    <p><strong>Reviewer:</strong> ${review.reviewer}</p>
                    <p><strong>Project:</strong> ${review.project}</p>
                    <p><strong>Rating:</strong> ${review.rating} (${review.review_text})</p>
                    <p><strong>Review Date:</strong> ${new Date(review.created_at).toLocaleDateString()}</p>
                    <hr>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error fetching reviews:', error));
}

// Function to render stars based on average rating
function renderStars(rating) {
    const starCount = Math.round(rating); // Round to nearest integer
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= starCount ? '⭐' : '☆'; // Filled star for ratings, empty star for others
    }
    return stars;
}
