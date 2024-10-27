const baseURL = 'https://freelancer-platform-api-17pq.onrender.com';

// Load the user profile on page load
const loadUserProfile = async () => {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('user_name');

    if (!userId) {
        console.error('User ID not found in localStorage');
        return;
    }

    try {
        // Fetch user data
        const userResponse = await fetch(`${baseURL}/user/users/${userId}/`);
        const userData = await userResponse.json();
        console.log('User Data:', userData);

        if (!userData.username) {
            console.error('Username not found in user data');
            return;
        }
        const fullName = `${userData.first_name} ${userData.last_name}`;
        console.log('Username:', username);

        // Fetch freelancer profile data
        const profileResponse = await fetch(`${baseURL}/user/freelancers/?user__username=${username}`);
        const profileData = await profileResponse.json();
        if (profileData.results && profileData.results.length > 0) {
            const freelancer_id = profileData.results[0].id;
            displayUserProfile(profileData.results[0], fullName);
            fetchProposals(freelancer_id);
            fetchReviews(freelancer_id);
        } else {
            console.error('No profile data found for this user');
            displayProfileForm();
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
                    <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
                    <p><strong>Portfolio:</strong> <a href="${user.url}" target="_blank">${user.url}</a></p>
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

// Fetch proposals by freelancer ID
async function fetchProposals(freelancer_id) {
    try {
        const response = await fetch(`${baseURL}/proposals/proposals/?freelancer_id=${freelancer_id}`);
        const data = await response.json();
        populateTable(data.results);
    } catch (error) {
        console.error("Error fetching proposals:", error);
    }
}

// Populate the table with fetched proposals
function populateTable(proposals) {
    const jobHistoryBody = document.getElementById("job-history-body");
    jobHistoryBody.innerHTML = "";

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
            const response = await fetch(`${baseURL}/proposals/proposals/${proposalId}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert("Proposal cancelled successfully.");
                loadUserProfile(); // Refresh the profile data and proposals
            } else {
                alert("Failed to cancel the proposal.");
            }
        } catch (error) {
            console.error("Error cancelling proposal:", error);
        }
    }
}

// Fetch available skills and populate the dropdown
const loadSkills = async () => {
    try {
        const skillsResponse = await fetch(`${baseURL}/user/skills/`);
        const skillsData = await skillsResponse.json();
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

// Display the profile creation form
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
    document.getElementById('freelancer-profile-form').addEventListener('submit', handleProfileSubmit);
    loadSkills();
};

// Handle profile form submission
const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const userId = localStorage.getItem('user_id');
    if (!userId) {
        console.error('User ID not found in localStorage');
        return;
    }

    const formData = new FormData();
    formData.append('user', userId);
    formData.append('profile_pic', document.getElementById('profile_pic').files[0]);
    formData.append('portfolio_url', document.getElementById('portfolio_url').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('bio', document.getElementById('bio').value);
    formData.append('location', document.getElementById('location').value);

    const selectedSkills = Array.from(document.getElementById('skills').selectedOptions).map(option => option.value);
    selectedSkills.forEach(skillId => formData.append('skills', skillId));

    try {
        const response = await fetch(`${baseURL}/user/freelancers/`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert('Profile created successfully.');
            loadUserProfile();
        } else {
            const errorData = await response.json();
            console.error('Error creating profile:', errorData);
            alert('Profile creation failed.');
        }
    } catch (error) {
        console.error('Error submitting profile form:', error);
    }
};

// Load the user profile on page load
document.addEventListener('DOMContentLoaded', loadUserProfile);
