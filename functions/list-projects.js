// Netlify function that finds all project files in a folder and sends them as a list
const fs = require("fs").promises;
const path = require("path");

exports.handler = async () => {
  try {
    const directoryPath = path.join(process.cwd(), "content/projects");
    const files = await fs.readdir(directoryPath);
    const projectFiles = files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(".md", ""));
    return {
      statusCode: 200,
      body: JSON.stringify(projectFiles),
    };
  } catch (error) {
    console.error("Error reading projects directory:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to list projects" }),
    };
  }
};
