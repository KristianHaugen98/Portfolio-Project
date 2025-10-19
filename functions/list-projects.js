// Netlify function that finds all project files in a folder and sends them as a list
import { promises as fs } from "fs";
import { join } from "path";

export async function handler() {
  try {
    const directoryPath = join(process.cwd(), "content/projects");
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
}
