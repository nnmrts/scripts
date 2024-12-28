/* eslint-disable max-statements */
import { join } from "@std/path";

import md from "markdown-ast";

import { inputsFolderPath } from "../_common/_exports.js";

const {
	readTextFile
} = Deno;

const inputFilePath = join(inputsFolderPath, "markdown.md");
const inputFileContent = await readTextFile(inputFilePath);

/**
 *
 * @param token
 * @param listLevel
 * @example
 */
const tokenToString = (token, listLevel = -1) => {
	switch (token.type) {
		case "bold":
			return `[b]${blockToString(token.block)}[/b]`;
		case "border":
			return "[hr]";

		case "break":

		case "text":
			return token.text;

		case "codeSpan":
			return `[code]${token.code}[/code]`;

		case "italic":
			return `[i]${blockToString(token.block)}[/i]`;

		case "link":
			return `@[${token.block[0].text}](${token.url})`;

		case "list":
			return `[*]${blockToString(token.block)}\n`;

		case "quote":
			return `[quote]${blockToString(token.block)}[/quote]`;

		case "title":
			return `[h${token.rank}] ${blockToString(token.block)} [/h${token.rank}]`;

		default:
			return "";
	}
};

/**
 *
 * @param block
 * @example
 */
const blockToString = (block) => {
	let result = "";
	let lastListLevel = -1;

	for (const token of block) {
		if (token.type === "list") {
			const currentListLevel = Math.floor(token.indent.length / 1);

			// Open new lists if needed
			if (currentListLevel > lastListLevel) {
				for (let index = lastListLevel + 1; index <= currentListLevel; index++) {
					result += token.bullet.trim().match(/^\d+\.$/u) === null
						? "[list]"
						: "[list=1]";
				}
			}
			// Close lists if needed
			else if (currentListLevel < lastListLevel) {
				for (let index = lastListLevel; index > currentListLevel; index--) {
					result += "[/list]\n";
				}
			}

			lastListLevel = currentListLevel;

			result += tokenToString(token, currentListLevel);
			continue;
		}
		else if (lastListLevel > -1) {
			// Close any open lists
			for (let index = lastListLevel; index >= 0; index--) {
				result += "[/list]\n";
			}
			lastListLevel = -1;
		}

		result += tokenToString(token);
	}

	// Close any remaining open lists
	if (lastListLevel > -1) {
		for (let index = lastListLevel; index >= 0; index--) {
			result += "[/list]\n";
		}
		lastListLevel = -1;
	}

	return result;
};

/**
 *
 * @param string
 * @example
 */
const convert = (string) => {
	console.log(md(string));

	return blockToString(md(string));
};

console.log(convert(inputFileContent));
