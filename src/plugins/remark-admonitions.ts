import type { AdmonitionType } from "@/types";
import { type Properties, h as _h } from "hastscript";
import type { Node, Paragraph as P, Parent, PhrasingContent, Root } from "mdast";
import type { Directives, LeafDirective, TextDirective } from "mdast-util-directive";
import { directiveToMarkdown } from "mdast-util-directive";
import { toMarkdown } from "mdast-util-to-markdown";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// Supported admonition types
const Admonitions = new Set<AdmonitionType>(["tip", "note", "important", "caution", "warning"]);

/** Checks if a string is a supported admonition type. */
function isAdmonition(s: string): s is AdmonitionType {
	return Admonitions.has(s as AdmonitionType);
}

/** Checks if a node is a directive. */
function isNodeDirective(node: Node): node is Directives {
	return (
		node.type === "containerDirective" ||
		node.type === "leafDirective" ||
		node.type === "textDirective"
	);
}

/**
 * From Astro Starlight:
 * Transforms directives not supported back to original form as it can break user content and result in 'broken' output.
 */
function transformUnhandledDirective(
	node: LeafDirective | TextDirective,
	index: number,
	parent: Parent,
) {
	const textNode = {
		type: "text",
		value: toMarkdown(node, { extensions: [directiveToMarkdown()] }),
	} as const;
	if (node.type === "textDirective") {
		parent.children[index] = textNode;
	} else {
		parent.children[index] = {
			children: [textNode],
			type: "paragraph",
		};
	}
}

/** From Astro Starlight: Function that generates an mdast HTML tree ready for conversion to HTML by rehype. */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function h(el: string, attrs: Properties = {}, children: any[] = []): P {
	const { properties, tagName } = _h(el, attrs);
	return {
		children,
		data: { hName: tagName, hProperties: properties },
		type: "paragraph",
	};
}

export const remarkAdmonitions: Plugin<[], Root> = () => (tree) => {
	visit(tree, (node, index, parent) => {
		if (!parent || index === undefined || !isNodeDirective(node)) return;
		
		// Handle text directives by transforming them back to markdown
		if (node.type === "textDirective") {
			transformUnhandledDirective(node, index, parent);
			return;
		}

		const admonitionType = node.name;
		if (!isAdmonition(admonitionType)) return;





		// Check if there's a custom title in the directive attributes
		// The syntax is :::keyword{title="Custom title"}
		let title: string = admonitionType;
		let titleNode: PhrasingContent[] = [{ type: "text", value: title }];
		let content: any[] = [];

		// Check if the directive has a title attribute
		if (node.attributes && node.attributes.title) {
			title = node.attributes.title;
			titleNode = [{ type: "text", value: title }];
		}

		if (node.type === "leafDirective") {
			// For leaf directives, content is in node.value
			const contentText = (node as any).value || '';
			content = [{ type: "paragraph", children: [{ type: "text", value: contentText }] }];
		} else {
			// For container directives, use the children
			content = node.children;
		}

		// Do not change prefix to AD, ADM, or similar, adblocks will block the content inside.
		const admonition = h(
			"aside",
			{ "aria-label": title, class: "admonition", "data-admonition-type": admonitionType },
			[
				h("p", { class: "admonition-title", "aria-hidden": "true" }, [...titleNode]),
				h("div", { class: "admonition-content" }, content),
			],
		);

		parent.children[index] = admonition;
	});
};
