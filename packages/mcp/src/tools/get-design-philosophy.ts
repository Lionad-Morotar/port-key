import { z } from "zod";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPPORTED_LANGUAGES = ["cn", "es", "fr", "de", "ja", "ko", "ru", "ar", "pt", "it"];

async function loadLocale(lang: string): Promise<string> {
  const localePath = join(__dirname, "..", "..", "locales", `${lang}.json`);
  try {
    const content = await readFile(localePath, "utf-8");
    const locale = JSON.parse(content);
    return locale.designPhilosophy || "";
  } catch {
    return "";
  }
}

export const getDesignPhilosophyTool = {
  name: "get-design-philosophy",
  title: "Get PortKey Design Philosophy",
  description: "Get design philosophy and background of PortKey",
  inputSchema: {
    lang: z.enum([...SUPPORTED_LANGUAGES] as [string, ...string[]]).default("cn"),
  },
  execute: async ({ lang = "cn" }: any) => {
    try {
      const philosophy = await loadLocale(lang);
      return {
        content: [
          {
            type: "text",
            text: philosophy,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error && typeof error === "object" && "message" in error ? String(error.message) : String(error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: errorMessage }),
          },
        ],
        isError: true,
      };
    }
  }
};
