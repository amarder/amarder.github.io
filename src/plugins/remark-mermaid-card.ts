import type { Root } from "mdast";
import type { Code } from "mdast";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { ContainerDirective } from "mdast-util-directive";

const isCodeMermaid = (node: unknown): node is Code => {
	const n = node as Record<string, unknown>;
	return typeof n.type === "string" && n.type === "code" && n.lang === "mermaid";
};

export const remarkMermaidCard: Plugin<[], Root> = () => (tree, file) => {
	visit(tree, (node, index, parent) => {
		if (!parent || typeof index !== "number" || !isCodeMermaid(node)) return;

		const cardDirective: ContainerDirective = {
			type: "containerDirective",
			name: "card",
			attributes: {},
			children: [node],
		};

		parent.children.splice(index, 1, cardDirective);
	});
}; 