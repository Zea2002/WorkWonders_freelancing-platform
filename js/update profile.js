const user_name = localStorage.getItem("user_name"); // Assuming user_name is stored in localStorage
const apiUrl = "http://127.0.0.1:8000/client/";

// Fetch and display user profile data
async function fetchUserProfile() {
    try {
        const response = await fetch(`${apiUrl}clientprofiles/${user_name}/`);
        if (response.ok) {
            const profileData = await response.json();
            if (profileData) {
                // Profile data is available
                document.getElementById('client-profile').innerHTML = `
                    <div class="col-lg-6 col-md-8">
                        <div class="card">
                            <img src="${profileData.profile_pic}" class="card-img-top" alt="Profile Picture">
                            <div class="card-body">
                                <h5 class="card-title">${profileData.company_name}</h5>
                                <p class="card-text">${profileData.bio}</p>
                                <p class="card-text"><strong>Location:</strong> ${profileData.location}</p>
                                <p class="card-text"><strong>Balance:</strong> $${profileData.balance}</p>
                            </div>
                        </div>
                    </div>
                `;
                // Fill form with existing data
                document.getElementById('company_name').value = profileData.company_name;
                document.getElementById('phone').value = profileData.phone;
                document.getElementById('profile_pic').value = profileData.profile_pic;
                document.getElementById('company_website').value = profileData.company_website;
                document.getElementById('bio').value = profileData.bio;
                document.getElementById('location').value = profileData.location;
                document.getElementById('balance').value = profileData.balance;
            } else {
                // Profile data is not available (null)
                document.getElementById('client-profile').innerHTML = '<p>No profile data available.</p>';
            }
        } else {
            console.error('Error fetching user profile:', response.statusText);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Update user profile data
async function updateUserProfile(event) {
    event.preventDefault(); // Prevent default form submission
    const updatedProfile = {
        company_name: document.getElementById('company_name').value,
        phone: document.getElementById('phone').value,
        profile_pic: document.getElementById('profile_pic').value,
        company_website: document.getElementById('company_website').value,
        bio: document.getElementById('bio').value,
        location: document.getElementById('location').value,
        balance: document.getElementById('balance').value,
    };

    try {
        // Check if the profile already exists
        const response = await fetch(`${apiUrl}clientprofiles/${user_name}/`);
        
        if (response.ok) {
            // Profile exists, use PUT method
            const profileData = await response.json();
            const updateResponse = await fetch(`${apiUrl}clientprofiles/${profileData.id}/`, { // Update URL with profile ID
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProfile),
            });

            if (updateResponse.ok) {
                document.getElementById('submission-message').textContent = 'Profile updated successfully!';
            } else {
                const errorData = await updateResponse.json();
                document.getElementById('submission-message').textContent = errorData.error || 'Failed to update profile.';
            }
        } else {
            // Profile does not exist, use POST method
            const createResponse = await fetch(`${apiUrl}clientprofiles/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProfile),
            });

            if (createResponse.ok) {
                document.getElementById('submission-message').textContent = 'Profile created successfully!';
            } else {
                const errorData = await createResponse.json();
                document.getElementById('submission-message').textContent = errorData.error || 'Failed to create profile.';
            }
        }

        // Refresh profile data after update/create
        fetchUserProfile(); 
    } catch (error) {
        console.error('Update error:', error);
        document.getElementById('submission-message').textContent = 'An error occurred while updating profile.';
    }
}

// Call this function to fetch and display the profile data when the page loads
fetchUserProfile();

// Add an event listener to the form
document.getElementById('userProfileForm').addEventListener('submit', updateUserProfile);
