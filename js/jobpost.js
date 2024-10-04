let allProjects = []; 

const loadCategory = () => {
    fetch("https://freelancer-platform-api-17pq.onrender.com/projects/category/")
        .then((res) => res.json())
        .then((data) => {
            const result = data.results;
            const parent = document.getElementById("category-filter");
            parent.innerHTML = ''; 
            result.forEach((item) => {
                const li = document.createElement("li");
                li.classList.add("dropdown-item");
                li.innerHTML = `<a href="#" onclick="filterProjects('${item.id}')">${item.name}</a>`;
                parent.appendChild(li);
            });
        })
        .catch((error) => console.error("Error loading categories:", error));
};

const loadProjects = async () => {
    try {
        const res = await fetch("https://freelancer-platform-api-17pq.onrender.com/projects/projects/");
        const data = await res.json();
        allProjects = data.results; 
        displayProjects(allProjects); 
    } catch (error) {
        console.error("Error loading projects:", error);
    }
};

const displayProjects = (projects) => {
    const projectList = document.getElementById("project-list");
    projectList.innerHTML = ''; 
    projects.forEach((project) => {
        const col = document.createElement("div");
        col.classList.add("col-md-6", "col-lg-4", "mb-4");
        col.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${project.title}</h5>
                    <p class="card-text">${project.description}</p>
                    <p class="card-text"><strong>Budget:</strong> $${project.budget}</p>
                    <p class="card-text"><strong>Deadline:</strong> ${new Date(project.deadline).toLocaleDateString()}</p>
                    <a href="job-detail.html?id=${project.id}" class="btn btn-primary">Details</a>
                </div>
            </div>
        `;
        projectList.appendChild(col);
    });
};

const filterProjects = async (categoryId) => {
    try {
        const res = await fetch(`https://freelancer-platform-api-17pq.onrender.com/projects/projects/?category=${categoryId}`);
        const data = await res.json();
        displayProjects(data.results); 
    } catch (error) {
        console.error("Error filtering projects:", error);
    }
};


document.getElementById("sortProjects").addEventListener("change", (event) => {
    const sortOrder = event.target.value;
    const sortedProjects = [...allProjects]; 

    
    sortedProjects.sort((a, b) => {
        return sortOrder === "asc" ? a.budget - b.budget : b.budget - a.budget;
    });

    displayProjects(sortedProjects); 
});


loadCategory();
loadProjects();
