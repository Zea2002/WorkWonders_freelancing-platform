const baseURL = 'https://freelancer-platform-api-17pq.onrender.com';

// Function to load the user profile
const loadUserProfile = async () => {
    const userId = localStorage.getItem('user_id');

    if (!userId) {
        console.error('User ID not found in localStorage');
        return;
    }

    try {
        const userResponse = await fetch(`${baseURL}/user/users/${userId}/`);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();
        const client_username=userData.username;

        const fullName = `${userData.first_name} ${userData.last_name}`;
        const profileResponse = await fetch(`${baseURL}/user/client/?user=${userData.username}`);
        if (!profileResponse.ok) throw new Error('Failed to fetch client profile data');
        const profileData = await profileResponse.json();

        const client_id = profileData.results[0].id;

        if (profileData.results.length > 0) {
            displayUserProfile(profileData.results[0], fullName);
            getProjectsByClient(client_id,client_username);
        } else {
            console.error('No profile data found for this user');
        }

    } catch (error) {
        console.error('Error fetching client profile:', error);
    }
};

// Function to display the user profile in the DOM
const displayUserProfile = (user, fullName) => {
    const profileContainer = document.getElementById('client-profile');

    if (user) {
        profileContainer.innerHTML = `
            <div class="col-md-8 mx-auto profile-card p-4 border rounded shadow-sm bg-light">
                <div class="text-center">
                    <img src="${user.profile_pic}" alt="Profile Picture" class="profile-img mb-3 rounded-circle" style="width: 120px; height: 120px;">
                    <h4 class="mb-2">${fullName}</h4>
                    <p class="text-muted mb-1"><strong>Company Name:</strong> ${user.company_name || 'N/A'}</p>
                    <p class="text-muted mb-1"><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
                    <p class="text-muted mb-1"><strong>Company Website:</strong> ${user.company_website || 'N/A'}</p>
                    <p class="text-muted mb-1"><strong>Location:</strong> ${user.location || 'Unknown'}</p>
                    <p class="text-muted mb-1"><strong>Balance:</strong> $${user.balance || '0.00'}</p>
                    <p class="text-muted mb-1"><strong>Is Verified:</strong> ${user.is_verified ? 'Yes' : 'No'}</p>
                    <button class="btn btn-primary" onclick="toggleProfileDetails('${user.bio}', '${user.location}', '${user.phone}')">Details</button>
                    <div id="profile-details" style="display: none; margin-top: 15px;">
                        <hr>
                        <p><strong>Bio:</strong> ${user.bio || 'No bio available.'}</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        profileContainer.innerHTML = `<p class="text-center text-danger">Profile not found</p>`;
    }
};

// Function to toggle profile details visibility
const toggleProfileDetails = (bio, location, phone) => {
    const detailsDiv = document.getElementById('profile-details');
    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
};

// Function to fetch and display the projects posted by the client
const getProjectsByClient = (client_id,client_username) => {
    const url = `${baseURL}/projects/projects/?client=${client_id}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const projectListDiv = document.getElementById('project-list');
            projectListDiv.innerHTML = ''; // Clear previous content

            if (data.results.length > 0) {
                data.results.forEach(project => {
                    const projectDiv = document.createElement('div');
                    projectDiv.className = 'col-md-6 mb-4';

                    projectDiv.innerHTML = `
                        <div class="card project-card shadow-sm border-0">
                            <div class="card-body">
                                <h5>${project.title}</h5
                                <p class="text-muted">${project.description}</p>
                                <p><strong>Budget:</strong> $${project.budget}</p>
                                <p><strong>Deadline:</strong> ${new Date(project.deadline).toLocaleDateString()}</p>
                                <button class="btn btn-info mt-2" onclick="toggleProjectDetails(${project.id},'${project.title}','${client_username}')">Details</button>
                                <div id="project-details-${project.id}" class="project-details" style="display: none;">
                                    <hr>
                                    <p><strong>Category:</strong> ${project.category}</p>
                                    <p><strong>Created At:</strong> ${new Date(project.created_at).toLocaleString()}</p>
                                    <p><strong>Attachment:</strong> ${project.attachment ? `<a href="${project.attachment}" target="_blank">View</a>` : 'No attachment'}</p>
                                    <h6>All Proposals for the Project</h6>  
                                    <div id="proposals-${project.id}" class="proposals-section mt-3"></div>
                                </div>
                            </div>
                        </div>
                    `;

                    projectListDiv.appendChild(projectDiv);
                });
            } else {
                projectListDiv.innerHTML = '<p>No projects found for this client.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching project data:', error);
        });
};

// Function to toggle project details visibility and fetch proposals
const toggleProjectDetails = (projectId, projectTitle,client_username) => {
    const detailsDiv = document.getElementById(`project-details-${projectId}`);
    if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        fetchProposals(projectId, projectTitle,client_username);
    } else {
        detailsDiv.style.display = 'none';
    }
};

// Function to fetch proposals for a project
const fetchProposals = async (projectId, projectTitle,client_username) => {
    const proposalsDiv = document.getElementById(`proposals-${projectId}`);
    proposalsDiv.innerHTML = '<p>Loading proposals...</p>';

    try {
        const response = await fetch(`${baseURL}/proposals/proposals/?project=${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch proposals');

        const data = await response.json();
        if (data.results.length > 0) {
            let proposalsHTML = '';
            data.results.forEach(proposal => {
                proposalsHTML += `
                    <div class="proposal-card mb-3 border rounded p-3 bg-light">
                        <p><strong>Freelancer ID:</strong> ${proposal.freelancer}</p>
                        <p><strong>About Proposal:</strong> ${proposal.about_on_project}</p>
                        <p><strong>Proposed Price:</strong> $${proposal.proposed_price}</p>
                        <p><strong>Status:</strong> ${proposal.proposal_status}</p>
                        <label for="status-select-${proposal.id}"><strong>Update Status:</strong></label>
                        <select id="status-select-${proposal.id}" class="form-select" onchange="updateProposalStatus(${proposal.id})">
                            <option value="Pending" ${proposal.proposal_status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Accepted" ${proposal.proposal_status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                            <option value="Rejected" ${proposal.proposal_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            <option value="Completed" ${proposal.proposal_status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                         ${proposal.proposal_status === 'Completed' ? `
                            <div class="review-section">
                                <h5>Leave a Review</h5>
                                <label><strong>Rating:</strong></label>
                                <select id="rating-${proposal.id}" class="form-select">
                                    <option value="⭐">⭐</option>
                                    <option value="⭐⭐">⭐⭐</option>
                                    <option value="⭐⭐⭐">⭐⭐⭐</option>
                                    <option value="⭐⭐⭐⭐">⭐⭐⭐⭐</option>
                                    <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐</option>
                                </select>
                                <label><strong>Review:</strong></label>
                                <textarea id="review-text-${proposal.id}" class="form-control" rows="3"></textarea>
                                <button class="btn btn-primary mt-2" onclick="submitReview(${proposal.id}, '${projectTitle}','${client_username}')">Submit Review</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            proposalsDiv.innerHTML = proposalsHTML;
        } else {
            proposalsDiv.innerHTML = '<p>No proposals found for this project.</p>';
        }
    } catch (error) {
        console.error('Error fetching proposals:', error);
        proposalsDiv.innerHTML = '<p>Error loading proposals.</p>';
    }
};

// Function to submit review
const submitReview =async (proposalId,projectTitle,client_username) => {
    const rating = document.getElementById(`rating-${proposalId}`).value;
    const reviewText = document.getElementById(`review-text-${proposalId}`).value;
    console.log('project title', projectTitle); 
    try {
        // Fetch proposal data to get project title and freelancer ID
        const proposalResponse = await fetch(`${baseURL}/proposals/proposals/${proposalId}/`);
        if (!proposalResponse.ok) throw new Error('Failed to fetch proposal data');
        const proposalData = await proposalResponse.json();
        
        const freelancerId = proposalData.freelancer; 
      
      
        const freelancerResponse = await fetch(`${baseURL}/user/freelancers/${freelancerId}/`);
        if (!freelancerResponse.ok) throw new Error('Failed to fetch freelancer data');
        const freelancerData = await freelancerResponse.json();
        const freelancerUsername = freelancerData.username; 

        // Get reviewer username from local storage
        const reviewerUsername = localStorage.getItem('user_name');


     console.log( 'freelancer:', freelancerUsername,
        'project:', projectTitle,
        'reviewer:', client_username,
        'rating:', rating,
        'review_text:', reviewText);
    const reviewData = {
        freelancer: freelancerUsername,
        project: projectTitle,
        reviewer: client_username,
        rating: rating,
        review_text: reviewText,
    };

    // Submit the review
    const response = await fetch(`${baseURL}/reviews/reviews/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
    });

    if (!response.ok) throw new Error('Failed to submit review');

    alert('Review submitted successfully');
} 
catch (error) 
{
    console.error('Error submitting review:', error);
    alert('Failed to submit review');
}
};

// Function to update proposal status
const updateProposalStatus = async (proposalId) => {
    const selectElement = document.getElementById(`status-select-${proposalId}`);
    const newStatus = selectElement.value;

    try {
        const response = await fetch(`${baseURL}/proposals/proposals/${proposalId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ proposal_status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update proposal status');

        alert('Proposal status updated successfully');
        loadUserProfile(); 
    } catch (error) {
        console.error('Error updating proposal status:', error);
    }
};


// make profile
const displayProfileForm = () => {
    const profileContainer = document.getElementById('client-profile');
    profileContainer.innerHTML = `
        <form id="client-profile-form" class="col-md-8 mx-auto p-4 border rounded shadow-sm bg-light">
            <h4 class="mb-3">Complete Your Profile</h4>
            <div class="form-group">
                <label for="company-name">Company Name</label>
                <input type="text" id="company-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone</label>
                <input type="text" id="phone" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="profile-pic">Profile Picture</label>
                <input type="file" id="profile-pic" class="form-control">
            </div>
            <div class="form-group">
                <label for="company-website">Company Website</label>
                <input type="url" id="company-website" class="form-control">
            </div>
            <div class="form-group">
                <label for="bio">Bio</label>
                <textarea id="bio" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="location">Location</label>
                <input type="text" id="location" class="form-control">
            </div>
            <button type="submit" class="btn btn-primary mt-3">Submit</button>
        </form>
    `;

   
    document.getElementById('client-profile-form').addEventListener('submit', submitProfileForm);
};

// Function to submit profile form data
const submitProfileForm = async (event) => {
    event.preventDefault();

    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        console.error('User ID or username not found in localStorage');
        return;
    }

    const companyName = document.getElementById('company-name').value;
    const phone = document.getElementById('phone').value;
    const profilePic = document.getElementById('profile-pic').files[0];
    const companyWebsite = document.getElementById('company-website').value;
    const bio = document.getElementById('bio').value;
    const location = document.getElementById('location').value;

    const formData = new FormData();
    formData.append('user', userId);
    formData.append('company_name', companyName);
    formData.append('phone', phone);
    if (profilePic) formData.append('profile_pic', profilePic);
    formData.append('company_website', companyWebsite);
    formData.append('bio', bio);
    formData.append('location', location);

    try {
        const response = await fetch(`${baseURL}/user/client/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to create/update profile');

        alert('Profile created/updated successfully');
        loadUserProfile(); 
    } catch (error) {
        console.error('Error submitting profile:', error);
        alert('Failed to create/update profile');
    }
};
document.addEventListener('DOMContentLoaded', function () {
    
    const noProfileExists = true; 

    if (noProfileExists) {
        displayProfileForm(); 
    }
});


window.onload = loadUserProfile;

