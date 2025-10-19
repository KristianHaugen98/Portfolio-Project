// This updates the time for when the pages was last modified:
document.getElementById("last-updated").textContent = new Date(
  document.lastModified
).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// JavaScript to fetch content from Decap CMS to my site:

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
  const match = markdownContent.match(
    /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)?$/
  );
  const data = {};
  if (match) {
    const yaml = match[1];
    const body = match[2]?.trim() || "";
    yaml.split("\n").forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length > 0) {
        data[key.trim()] = rest.join(":").trim().replace(/["']/g, "");
      }
    });
    data.content = body;
  } else {
    console.warn("YAML frontmatter not found or malformed:", markdownContent);
  }
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
    data.content ||
    "Front-End Developer with passion for clean design and user-friendly web experience.";
});

// 4. This will render about (single file):
renderContent("/content/about/data.md", (data) => {
  document.getElementById("about-bio").textContent =
    data.bio ||
    "Im a Front-End Developer student at Noroff who enjoys creating interactive and responsive web experience. Im dedicated to writing code that not only looks good, but also performs amoothly across all devices, and see the creation of it. My goal is to make technologies that does good for the world. Im also an active person who love to work out and take care of my body with good work/life balance. Im also currently working as an shop assistan who have expertice in computer and mobile / tablets. Where i sell tech products as well, and help customers with related stuff.";
});

// 5. Render skills (list of files in folder - fetch all):
async function renderSkills() {
  const skillsList = document.getElementById("skills-list");
  skillsList.innerHTML = ""; // Tøm eksisterende innhold
  const staticSkills = document.querySelector(
    ".row.g-3.justify-content-center"
  );
  if (staticSkills) staticSkills.style.display = "none"; // Temporarily hide static skills
  const skills = [
    "map-skill-html-5",
    "map-skill-css-bootstrap",
    "map-skill-javascript",
    "map-skill-figma-design",
  ];
  // Add container and row for centering and grid
  const container = document.createElement("div");
  container.className = "container";
  const row = document.createElement("div");
  row.className = "row g-3 justify-content-center";
  container.appendChild(row);
  skillsList.appendChild(container);

  for (const skill of skills) {
    await renderContent(`/content/skills/${skill}.md`, (data) => {
      console.log(`Processing ${skill}.md, data:`, data); // For Debugging
      if (data.skill) {
        const skillDiv = document.createElement("div");
        skillDiv.className = "col-4 col-md-2"; // Responsive column width
        skillDiv.innerHTML = `<img src="/images/uploads/${data.skill.toLowerCase()}.png" class="img-fluid" alt="${
          data.skill
        }" style="max-width: 50px" />`;
        row.appendChild(skillDiv);
      } else {
        console.warn(`No skill data found in ${skill}.md`);
      }
    });
  }
  // Show static skills as fallback if no data is loaded.
  if (skillsList.querySelectorAll(".col-4").length === 0 && staticSkills) {
    staticSkills.style.display = "";
  }
}
renderSkills();

// This will render projects (list of files in folder from GitHub
//  1.
async function fetchProjectFilesFromGitHub() {
  const repo = "kristianhaugen98/portfolio-project";
  const branch = "main";
  const url = `https://api.github.com/repos/${repo}/contents/content/projects?ref=${branch}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("GitHub API response not OK");
    const files = await response.json();

    return files
      .filter((file) => file.name.endsWith(".md"))
      .map((file) => file.name.replace(".md", ""));
  } catch (error) {
    console.error("GitHub API error:", error);
    return [];
  }
}

//  3. Render projects
async function renderProjects() {
  const projectsList = document.getElementById("projects-list");
  const staticProjects = document.querySelector(
    ".row.g-4.justify-content-center"
  );
  if (staticProjects) staticProjects.style.display = "none";

  projectsList.innerHTML = `
    <div class="container">
      <div class="row g-4 justify-content-center"></div>
    </div>
  `;
  const projectsRow = projectsList.querySelector(".row");

  const projectFiles = await fetchProjectFilesFromGitHub();

  for (const file of projectFiles) {
    try {
      const response = await fetch(`/content/projects/${file}.md`);
      if (!response.ok) throw new Error(`Could not fetch ${file}.md`);
      const markdown = await response.text();
      const data = parseFrontmatter(markdown);

      const title = data.title || file;
      const description =
        data.description || data.content || "No description available";
      const link = data.link || "#";
      const imagePath = data.image?.startsWith("/")
        ? data.image
        : `/images/uploads/${data.image || file}.png`;
      // Creating the cards
      const projectDiv = document.createElement("div");
      projectDiv.className = "col-12 col-md-4";
      projectDiv.innerHTML = `
        <div class="card shadow-lg" style="width: 100%;">
          <img src="${imagePath}" class="card-img-top img-fluid" style="height: 180px" alt="${title}" />
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
            <a href="${link}" class="btn btn-primary" target="_blank" rel="noopener">
              ${link !== "#" ? "Go to website" : "No link"}
            </a>
          </div>
        </div>
      `;
      projectsRow.appendChild(projectDiv);
    } catch (error) {
      console.warn(`Could not load ${file}.md`, error);
    }
  }

  // Fallback if noe project is shown
  if (projectsRow.children.length === 0 && staticProjects) {
    staticProjects.style.display = "";
    projectsList.innerHTML = "";
  }
}

//  Starts rendering
renderProjects();
