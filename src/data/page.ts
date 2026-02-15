import { type CollectionEntry, getCollection } from "astro:content";

/** filter out draft pages based on the environment */
export async function getAllPages(): Promise<CollectionEntry<"page">[]> {
	return await getCollection("page", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
}
