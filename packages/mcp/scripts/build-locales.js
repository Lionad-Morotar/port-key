import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_DIR = join(__dirname, "..", "..", "..", "docs");
const OUTPUT_DIR = join(__dirname, "..", "locales");

const LANGUAGES = ["cn", "es", "fr", "de", "ja", "ko", "ru", "ar", "pt", "it"];

function extractBriefSection(content) {
	const lines = content.split("\n");
	let briefLines = [];
	let inBriefSection = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line.startsWith("## ")) {
			if (inBriefSection) {
				break;
			}
			inBriefSection = true;
			continue;
		}

		if (inBriefSection) {
			if (line.trim() === "") {
				continue;
			}
			briefLines.push(line);
		}
	}

	return "以下是 PortKey 的设计理念：\n\n" + briefLines.join("\n");
}

async function buildLocales() {
	await mkdir(OUTPUT_DIR, { recursive: true });

	for (const lang of LANGUAGES) {
		const readmePath = lang === "en"
			? join(__dirname, "..", "..", "..", "README.md")
			: join(DOCS_DIR, `README.${lang}.md`);

		try {
			const content = await readFile(readmePath, "utf-8");
			const brief = extractBriefSection(content);
			const locale = { designPhilosophy: brief };
			const outputPath = join(OUTPUT_DIR, `${lang}.json`);
			await writeFile(outputPath, JSON.stringify(locale, null, 2), "utf-8");
			console.log(`Generated ${lang}.json`);
		} catch (error) {
			console.error(`Error processing ${lang}:`, error.message);
		}
	}
}

buildLocales();
