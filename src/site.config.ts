import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Andrew Marder",
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: "en-US",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
	// Used as the default description meta property and webmanifest description
	description: "Andrew Marder's personal blog about data science, economics, and technology",
	// HTML lang property, found in src/layouts/Base.astro L:18 & astro.config.ts L:48
	lang: "en-US",
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: "en_US",
	/* 
		- Used to construct the meta title property found in src/components/BaseHead.astro L:11 
		- The webmanifest name found in astro.config.ts L:42
		- The link value found in src/components/layout/Header.astro L:35
		- In the footer found in src/components/layout/Footer.astro L:12
	*/
	title: "Andrew Marder",
	// ! Please remember to replace the following site property with your own domain, used in astro.config.ts
	url: "https://andrewmarder.net/",
};

// Used to generate links in both the Header & Footer.
export const menuLinks: { path: string; title: string }[] = [
	{
		path: "/",
		title: "Home",
	},
	{
		path: "/posts/",
		title: "Archive",
	},
];

export const surveySubscription = {
	responseUrl:
		"https://surveys.andrewmarder.net/api/v1/client/cmqv2922w000301ypsz05w87q/responses",
	surveyId: "cmqv296ta000a01ypv4bhl0m9",
	emailFieldId: "hs3avz7lxabnw0xugjwl7t73",
} as const;
