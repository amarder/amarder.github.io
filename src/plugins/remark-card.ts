import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import type { ContainerDirective } from "mdast-util-directive";
import type { Plugin } from "unified";

const isDirective = (node: unknown): node is ContainerDirective => {
	const n = node as Record<string, unknown>;
	return typeof n.type === "string" && (n.type === "containerDirective");
};

export const remarkCard: Plugin<[], Root> = () => (tree) => {
	visit(tree, (node, index, parent) => {
		if (!parent || index === undefined || !isDirective(node)) return;
		if (node.name !== "card") return;

		const data = node.data || (node.data = {});
		data.hName = "div";
		data.hProperties = {
			class: "card",
		};
	});
}; 