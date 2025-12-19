import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const titleSchema = z.string().max(60);

const baseSchema = z.object({
	title: titleSchema,
});

const post = defineCollection({
	loader: glob({ base: "./src/content/post", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			toc: z.boolean().default(true),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => {
					if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
						// If it's a date-only string (YYYY-MM-DD), append time and use local timezone
						return new Date(val + 'T00:00:00');
					}
					return new Date(val);
				}),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => {
					if (!str) return undefined;
					if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
						// If it's a date-only string (YYYY-MM-DD), append time and use local timezone
						return new Date(str + 'T00:00:00');
					}
					return new Date(str);
				}),
		}),
});

const note = defineCollection({
	loader: glob({ base: "./src/content/note", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		description: z.string().optional(),
		publishDate: z
			.string()
			.datetime({ offset: true }) // Ensures ISO 8601 format with offsets allowed (e.g. "2024-01-01T00:00:00Z" and "2024-01-01T00:00:00+02:00")
			.transform((val) => new Date(val)),
	}),
});

const tag = defineCollection({
	loader: glob({ base: "./src/content/tag", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: titleSchema.optional(),
		description: z.string().optional(),
	}),
});

const slides = defineCollection({
	loader: glob({ base: "./src/content/slides", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: titleSchema,
		description: z.string(),
		publishDate: z
			.string()
			.or(z.date())
			.transform((val) => {
				if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
					return new Date(val + 'T00:00:00');
				}
				return new Date(val);
			}),
		draft: z.boolean().default(false),
		theme: z.enum(['black', 'white', 'league', 'beige', 'sky', 'night', 'serif', 'simple', 'solarized', 'blood', 'moon']).default('black'),
	}),
});

export const collections = { post, note, tag, slides };
