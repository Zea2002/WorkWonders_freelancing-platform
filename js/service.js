const apiUrl = 'https://freelancer-platform-api-17pq.onrender.com/service/service/';

async function fetchServices() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        displayServices(data.results); // Use data.results to access the services array
    } catch (error) {
        console.error('Error fetching services:', error);
    }
}

function displayServices(services) {
    const serviceContainer = document.getElementById('service-cards');
    serviceContainer.innerHTML = ''; // Clear the container before adding new content

    services.forEach(service => {
        const card = `
            <div class="col-md-4 mb-4">
                <div class="service-card">
                    <img src="${service.img || 'https://via.placeholder.com/300'}" class="service-image" alt="${service.title}">
                    <div class="p-3">
                        <h5 class="card-title">${service.title}</h5>
                        <p class="card-text">${service.description}</p>
                    </div>
                </div>
            </div>
        `;
        serviceContainer.innerHTML += card; 
    });
}

document.addEventListener('DOMContentLoaded', fetchServices);
