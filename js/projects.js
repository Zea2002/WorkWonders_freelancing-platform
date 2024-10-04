$(document).ready(function () {
    // Get the category name from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryName = urlParams.get('category');

    const apiUrl = 'https://freelancer-platform-api-17pq.onrender.com/projects/projects/';

    $.ajax({
        url: apiUrl,
        method: 'GET',
        success: function (data) {
            // Log the category name and project categories for debugging
            console.log('Category from URL:', categoryName);
            data.results.forEach(project => {
                console.log('Project category:', project.category);
            });

            // Filter projects based on the category name
            const filteredProjects = data.results.filter(project => project.category.toLowerCase() === categoryName.toLowerCase());
            displayProjects(filteredProjects);
        },
        error: function (error) {
            console.error('Error fetching projects:', error);
        }
    });

    function displayProjects(projects) {
        const container = $('#project-container');
        container.empty(); // Clear any existing content

        if (projects.length === 0) {
            container.append('<p class="text-center" style="font-size: 18px; color: #555;">No projects found for this category.</p>');
            return;
        }

        projects.forEach(project => {
            const card = `
                <div class="col-md-4 mb-4">
                    <div class="card" style="border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <div class="card-body" style="padding: 20px;">
                            <h5 class="card-title" style="font-size: 1.25rem; color: #333;">${project.title}</h5>
                            <p class="card-text" style="font-size: 0.9rem; color: #777;"><strong>Client:</strong> ${project.client}</p>
                            <p class="card-text" style="font-size: 0.9rem; color: #555;">${project.description}</p>
                            <p class="card-text" style="font-size: 0.9rem; color: #333;"><strong>Budget:</strong> $${project.budget}</p>
                            <p class="card-text" style="font-size: 0.9rem; color: #333;"><strong>Deadline:</strong> ${new Date(project.deadline).toLocaleDateString()}</p>
                            <p class="card-text" style="font-size: 0.9rem; color: #333;"><strong>Created At:</strong> ${new Date(project.created_at).toLocaleDateString()}</p>
                            ${project.attachment ? `<p class="card-text" style="font-size: 0.9rem; color: #333;"><strong>Attachment:</strong> <a href="${project.attachment}" target="_blank" style="color: #007bff; text-decoration: none;">View Attachment</a></p>` : ''}
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });
    }
});


// apply 
let projectTitle = null; // Global variable for project title
let projectId = null; // Global variable for project ID
let freelancerId = null; // Global variable for freelancer ID

// Function to load project details
const loadProjectDetails = async (id) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
        console.error("Authentication token not found.");
        document.getElementById("project-details").innerHTML = "You need to be logged in to view this content.";
        return;
    }

    try {
        const res = await fetch(`https://freelancer-platform-api-17pq.onrender.com/projects/projects/${id}/`, {
            headers: {
                "Authorization": `Bearer ${authToken}`,
            },
        });

        if (res.ok) {
            const projectData = await res.json();
            document.getElementById("project-title").innerText = projectData.title;
            document.getElementById("project-client").innerText = projectData.client;
            document.getElementById("project-category").innerText = projectData.category;
            document.getElementById("project-description").innerText = projectData.description;
            document.getElementById("project-budget").innerText = projectData.budget;
            document.getElementById("project-deadline").innerText = projectData.deadline;
            document.getElementById("project-created-at").innerText = projectData.created_at;

            if (projectData.attachment) {
                document.getElementById("project-attachment").innerHTML = `<a href="${projectData.attachment}" target="_blank">View Attachment</a>`;
            }

            projectTitle = projectData.title; // Set the project title
            projectId = id; // Set the project ID
        } else {
            const errorData = await res.json();
            console.error("Failed to fetch project details:", errorData);
            document.getElementById("project-details").innerHTML = "Failed to load project details.";
        }
    } catch (error) {
        console.error("Error fetching project details:", error);
        document.getElementById("project-details").innerHTML = "An error occurred while fetching project details.";
    }
};

// Function to load client information using username
const loadClientInfo = async (username) => {
    try {
        const res = await fetch(`https://freelancer-platform-api-17pq.onrender.com/user/client/?user=${username}`);

        if (res.ok) {
            const clientData = await res.json();
            if (clientData.results.length > 0) {
                const client = clientData.results[0];
                // Display client information on the webpage
                document.getElementById("client-name").innerText = client.user || "N/A"; // Assuming there's an element with id 'client-name'
                document.getElementById("client-company").innerText = client.company_name || "N/A"; // Assuming there's an element with id 'client-company'
                document.getElementById("client-phone").innerText = client.phone || "N/A"; // Assuming there's an element with id 'client-phone'
                document.getElementById("client-website").innerHTML = client.company_website ? `<a href="${client.company_website}" target="_blank">${client.company_website}</a>` : "N/A"; // Assuming there's an element with id 'client-website'
                document.getElementById("client-bio").innerText = client.bio || "N/A"; // Assuming there's an element with id 'client-bio'
                document.getElementById("client-location").innerText = client.location || "N/A"; // Assuming there's an element with id 'client-location'
                document.getElementById("client-verification").innerText = client.is_verified ? "Verified" : "Not Verified"; // Assuming there's an element with id 'client-verification'
                
                // Display profile picture if available
                if (client.profile_pic) {
                    document.getElementById("client-profile-pic").src = client.profile_pic; // Assuming there's an img element with id 'client-profile-pic'
                } else {
                    document.getElementById("client-profile-pic").src = "default-profile-pic.png"; // Placeholder image if no profile picture
                }
            } else {
                console.error("No client found for the user.");
                document.getElementById("client-info").innerText = "No client information available.";
            }
        } else {
            console.error("Failed to fetch client information.");
            document.getElementById("client-info").innerText = "Failed to load client information.";
        }
    } catch (err) {
        console.error("Error fetching client data:", err);
        document.getElementById("client-info").innerText = "An error occurred while fetching client information.";
    }
};

// Function to fetch freelancer ID using username
const loadUser = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
        console.error("User ID not found.");
        return;
    }

    try {
        const res = await fetch(`https://freelancer-platform-api-17pq.onrender.com/user/users/${user_id}`);
        if (res.ok) {
            const data = await res.json();
            const username = data.username;
            // Call loadClientInfo with the username
            loadClientInfo(username); // Fetch and display client information

            const freelancerRes = await fetch(`https://freelancer-platform-api-17pq.onrender.com/user/freelancers/?user=${username}`);

            if (freelancerRes.ok) {
                const freelancerData = await freelancerRes.json();
                if (freelancerData.results.length > 0) {
                    freelancerId = freelancerData.results[0]?.id;
                } else {
                    console.error("No freelancer found for the user.");
                }
            }
        }
    } catch (err) {
        console.error("Error fetching user data:", err);
    }
};

// Function to submit a proposal
const submitProposal = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const authToken = localStorage.getItem("authToken");
    
    if (!authToken || !freelancerId) {
        document.getElementById("submission-message").innerText = "Error: You must be logged in to submit a proposal.";
        return;
    }

    const aboutOnProject = document.getElementById("about-on-project").value;
    const proposedPrice = document.getElementById("proposed-price").value;
    const proposalData = {
        freelancer: freelancerId, // Use freelancer ID
        project: projectId, // Use project ID
        about_on_project: aboutOnProject,
        proposed_price: proposedPrice,
        proposal_status: "Pending",
    };

    try {
        const res = await fetch("https://freelancer-platform-api-17pq.onrender.com/proposals/proposals/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify(proposalData),
        });

        if (res.ok) {
            document.getElementById("submission-message").innerText = "Proposal submitted successfully!";
            document.getElementById("submission-form").reset(); // Reset the form after successful submission
        } else {
            const errorResponse = await res.json();
            console.error("Error details:", errorResponse); // Log the error details
            throw new Error(errorResponse.detail || "Failed to submit proposal");
        }
    } catch (error) {
        document.getElementById("submission-message").innerText = "Error submitting proposal: " + error.message;
    }
};

// Event listener for applying to a project
document.getElementById("apply-now").addEventListener("click", () => {
    document.getElementById("proposal-form").style.display = "block"; // Show the proposal form when "Apply Now" is clicked
});

// Set the project ID and load project details on page load
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Assuming the project ID is passed as a URL parameter
    if (id) {
        loadProjectDetails(id); // Load project details using the ID
    }

    // Load user data (freelancer ID)
    loadUser();

    // Attach submit event listener for proposal form
    document.getElementById("submission-form").addEventListener("submit", submitProposal);
});
