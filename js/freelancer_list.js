const apiFreelancersUrl = "https://freelancer-platform-api-17pq.onrender.com/user/freelancers/";
const apiReviewsUrl = "https://freelancer-platform-api-17pq.onrender.com/reviews/reviews/";

// Fetch and display all freelancers in cards
function fetchFreelancers() {
    fetch(apiFreelancersUrl)
        .then(response => response.json())
        .then(data => {
            const freelancers = data.results;
            const freelancerList = document.getElementById('freelancer-list');
            freelancerList.innerHTML = freelancers.map(freelancer => `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="${freelancer.profile_pic}" class="card-img-top" alt="Freelancer Image">
                        <div class="card-body">
                            <h5 class="card-title">${freelancer.username}</h5>
                            <p class="card-text">${freelancer.bio.slice(0, 100)}...</p>
                            <button class="btn btn-primary" onclick="showFreelancerDetails(${freelancer.id})">View Details</button>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error fetching freelancers:', error));
}

// Show freelancer details in a modal
function showFreelancerDetails(freelancerId) {
    fetch(`${apiFreelancersUrl}${freelancerId}/`)
        .then(response => response.json())
        .then(freelancer => {
            const freelancerDetails = document.getElementById('freelancer-details');
            const freelancerPhone = document.getElementById('freelancer-phone');
            const freelancerPortfolio = document.getElementById('freelancer-portfolio');
            const freelancerStatus = document.getElementById('freelancer-status');
            
            freelancerDetails.innerHTML = `
                <h3>${freelancer.username}</h3>
                <img src="${freelancer.profile_pic}" class="img-fluid mb-3" alt="Freelancer Image">
                <p><strong>Bio:</strong> ${freelancer.bio}</p>
                <p><strong>Location:</strong> ${freelancer.location}</p>
                <p><strong>Skills:</strong> ${freelancer.skill && freelancer.skill.length > 0 ? freelancer.skill.join(', ') : 'No skills listed'}</p>            `;
            freelancerPhone.textContent = freelancer.phone;
            freelancerPortfolio.href = freelancer.portfolio_url ? freelancer.portfolio_url : '#';
            freelancerPortfolio.textContent = freelancer.portfolio_url ? 'Visit Portfolio' : 'No Portfolio Available';
            freelancerStatus.textContent = freelancer.is_verified ? 'Verified' : 'Not Verified';

            fetchReviews(freelancerId);  

            var freelancerModal = new bootstrap.Modal(document.getElementById('freelancerModal'));
            freelancerModal.show();
        })
        .catch(error => console.error('Error fetching freelancer details:', error));
}

// Fetch and display reviews and calculate average rating
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

// Initialize freelancer list on page load
document.addEventListener('DOMContentLoaded', fetchFreelancers);
