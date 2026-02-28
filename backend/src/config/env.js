import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from backend folder (backend/.env)
const backendEnv = path.resolve(__dirname, "../../.env");
let result = dotenv.config({ path: backendEnv });

// Fallback: try project root if backend/.env not found
if (result.error && result.error.code === "ENOENT") {
  const rootEnv = path.resolve(__dirname, "../../../.env");
  dotenv.config({ path: rootEnv });
}
