// This updates the time for when the pages was last modified:
document.getElementById("last-updated").textContent = new Date(
  document.lastModified
).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// JavaScript to fetch content from Decap CMS to my site:

// 1. Function to parse YAML frontmatter from Markdown file:
function parseFrontmatter(markdownContent) {
  const frontmatterMatch = markdownContent.match(/---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};
  const yamlString = frontmatterMatch[1];
  const lines = yamlString.split("\n");
  const data = {};
  lines.forEach((line) => {
    const [key, value] = line.split(":").map((s) => s.trim());
    if (key && value) {
      data[key] = value.replace(/["']/g, "");
    }
  });
  return data;
}

// 2. now, this function to fetch and render a single file:
async function renderContent(filePath, updateFunction) {
  try {
    const response = await fetch(filePath);
    if (response.ok) {
      const content = await response.text();
      const data = parseFrontmatter(content);
      updateFunction(data);
    } else {
      console.warn(`Failed to load ${filePath}`);
      updateFunction({}); // Call with empty data for fallback
    }
  } catch (error) {
    console.error(`Error fetching ${filePath}:`, error);
    updateFunction({}); // Call with empty data for fallback
  }
}
// 3. This will render Hero (single file):
renderContent("/content/hero/data.md", (data) => {
  document.getElementById("hero-name").textContent =
    data.name || "Kristian Haugen";
  document.getElementById("hero-intro").textContent =
    data.intro ||
    "Front-End Developer with passion for clean design and user-friendly web experience";
});

// 4. This will render about (single file):
renderContent("/content/about/data.md", (data) => {
  document.getElementById("about-bio").textContent =
    data.bio || "I'm a Front-End student at Noroff...";
});

// 5. Render skills (list of files in folder - fetch all):
async function renderSkills() {
  const skillsList = document.getElementById("skills-list");
  skillsList.innerHTML = ""; // Clear existing content
  const staticSkills = document.querySelector(
    ".row.g-3.justify-content-center"
  );
  if (staticSkills) staticSkills.style.display = "none"; // Hide static skills
  const skills = ["html5", "css", "bootstrap", "javascript", "figma"];
  for (const skill of skills) {
    renderContent(`/content/skills/${skill}.md`, (data) => {
      if (data.skill) {
        const skillDiv = document.createElement("div");
        skillDiv.className = "col-4 col-md-2";
        skillDiv.innerHTML = `<img src="/images/${data.skill.toLowerCase()}.png" class="img-fluid" alt="${
          data.skill
        }" style="max-width: 50px" />`;
        skillsList.appendChild(skillDiv);
      }
    });
  }
}
renderSkills();

// This will render projects (list of files in folder):
async function renderProjects() {
  const projectsList = document.getElementById("projects-list");
  const staticProjects = document.querySelector(
    ".row.g-4.justify-content-center"
  );
  if (staticProjects) staticProjects.style.display = "none"; // Hide static projects
  projectsList.innerHTML = ""; // Clear existing content
  const projectFiles = ["game-hub", "youtube", "auction-bidding"];
  for (const file of projectFiles) {
    renderContent(`/content/projects/${file}.md`, (data) => {
      if (data.title) {
        const projectDiv = document.createElement("div");
        projectDiv.className = "col-12 col-md-4";
        projectDiv.innerHTML = `
          <div class="card shadow-lg" style="width: 100%;">
            <img src="/images/uploads/${
              data.image || file
            }.png" class="card-img-top img-fluid" style="height: 180px; object-fit: cover;" alt="${
          data.title
        }" />
            <div class="card-body">
              <h5 class="card-title">${data.title}</h5>
              <p class="card-text">${data.description}</p>
              <a href="${
                data.link
              }" class="btn btn-primary" target="_blank" rel="noopener">Go to website</a>
            </div>
          </div>
        `;
        projectsList.appendChild(projectDiv);
      }
      // Show static projects if no projects loaded
      if (
        projectFiles.indexOf(file) === projectFiles.length - 1 &&
        loadedProjects === 0 &&
        staticProjects
      ) {
        staticProjects.style.display = "block";
      } else if (staticProjects) {
        staticProjects.style.display = "none";
      }
    });
  }
}
renderProjects();
