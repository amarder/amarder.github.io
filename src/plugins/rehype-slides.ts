/**
 * Rehype plugin to transform HTML into Reveal.js slide structure
 * 
 * This plugin:
 * - Converts H1 headers into horizontal slides (top-level sections)
 * - Converts H2 headers into vertical slides (nested sections)
 * - Ignores horizontal rules (hr tags) for slide separation
 * 
 * This plugin runs globally but only processes files in src/content/slides/
 */

import type { Root, Element, RootContent } from 'hast';
import type { Plugin } from 'unified';

export const rehypeSlides: Plugin<[], Root> = () => (tree, file) => {
	// Get file path from VFile
	const filePath = file.history[0] || file.path || '';
	
	// Only process files from the slides collection
	if (!filePath.includes('/slides/') && !filePath.includes('\\slides\\')) {
		return;
	}

	const newChildren: RootContent[] = [];
	let currentSection: RootContent[] = [];
	let currentH1: Element | null = null;
	let h2Slides: RootContent[][] = [];
	let currentH2Slide: RootContent[] = [];
	let inH2 = false;

	for (const node of tree.children) {
		if (node.type !== 'element') {
			// Handle text nodes and other non-element content
			if (inH2) {
				currentH2Slide.push(node);
			} else if (currentH1) {
				currentSection.push(node);
			}
			continue;
		}

		const element = node as Element;

		if (element.tagName === 'h1') {
			// Save previous H1 section
			if (currentH1) {
				saveH1Section();
			}
			// Start new H1 section
			currentH1 = element;
			currentSection = [];
			h2Slides = [];
			currentH2Slide = [];
			inH2 = false;
		} else if (element.tagName === 'h2') {
			// If we were building an H1 section, save it as first vertical slide
			if (!inH2 && currentSection.length > 0 && currentH1) {
				h2Slides.push([currentH1, ...currentSection]);
				currentSection = [];
			}
			// Save previous H2 slide
			if (inH2 && currentH2Slide.length > 0) {
				h2Slides.push([...currentH2Slide]);
			}
			// Start new H2 slide
			currentH2Slide = [element];
			inH2 = true;
		} else if (element.tagName === 'hr') {
			// Skip horizontal rules
			continue;
		} else {
			// Regular content
			if (inH2) {
				currentH2Slide.push(element);
			} else if (currentH1) {
				currentSection.push(element);
			}
		}
	}

	// Save the last section
	if (currentH1) {
		saveH1Section();
	}

	function saveH1Section() {
		if (!currentH1) return;

		// Save last H2 slide if exists
		if (inH2 && currentH2Slide.length > 0) {
			h2Slides.push([...currentH2Slide]);
		}

		if (h2Slides.length > 0) {
			// Create vertical slides structure
			const verticalSections: Element[] = h2Slides.map(slideContent => ({
				type: 'element',
				tagName: 'section',
				properties: {},
				children: slideContent
			}));

			newChildren.push({
				type: 'element',
				tagName: 'section',
				properties: {},
				children: verticalSections
			});
		} else {
			// Simple horizontal slide (no H2s)
			newChildren.push({
				type: 'element',
				tagName: 'section',
				properties: {},
				children: [currentH1, ...currentSection]
			});
		}

		// Reset for next H1
		currentH1 = null;
		currentSection = [];
		h2Slides = [];
		currentH2Slide = [];
		inH2 = false;
	}

	tree.children = newChildren;
};
