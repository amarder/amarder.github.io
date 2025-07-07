import type { Root, Code } from "mdast";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { ContainerDirective } from "mdast-util-directive";

export const remarkMermaidCard: Plugin<[], Root> = () => (tree) => {
	visit(tree, "code", (node: Code, index, parent) => {
		if (
			node.lang !== "mermaid" ||
			!parent ||
			typeof index !== "number"
		) {
			return;
		}

		const cardDirective: ContainerDirective = {
			type: "containerDirective",
			name: "card",
			attributes: {},
			children: [node],
		};

		parent.children.splice(index, 1, cardDirective);
	});
};