import bbob from "@bbob/core";
import { render } from "@bbob/html";
import html5Preset from "@bbob/preset-html5";
import TurndownService from "turndown";

const turndownService = new TurndownService({
	bulletListMarker: "-",
	codeBlockStyle: "fenced",
	headingStyle: "atx"
});

turndownService.addRule("listItem", {
	filter: "li",

	/**
	 *
	 * @param content
	 * @param node
	 * @param options
	 * @example
	 */
	replacement: function (content, node, options) {
		content = content
			.replace(/^\n+/u, "")
			.replace(/\n+$/u, "\n")
			.replaceAll("\n", "\n    ");

		let prefix = `${options.bulletListMarker} `;
		const parent = node.parentNode;

		if (parent.nodeName === "OL") {
			const start = parent.getAttribute("start");
			const index = Array.prototype.indexOf.call(parent.children, node);

			prefix = `${start ? Number(start) + index : index + 1}.  `;
		}

		return (
			prefix + content + (node.nextSibling && !/\n$/u.test(content) ? "\n" : "")
		);
	}
});

/**
 *
 * @param string
 * @example
 */
const convert = (string) => turndownService.turndown(
	bbob(html5Preset()).process(string, { render }).html
);

export default convert;
