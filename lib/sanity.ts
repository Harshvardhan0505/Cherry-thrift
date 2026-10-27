import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

// The shop's Sanity project. These aren't secret: the dataset is public and
// only holds what the shop shows anyway.
export const SANITY_PROJECT_ID = "za4keqjy";
export const SANITY_DATASET = "production";
export const SANITY_STUDIO_URL = "https://cherrythrifts.sanity.studio/";

export const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2026-02-01",
  useCdn: true,
  perspective: "published",
});

const builder = createImageUrlBuilder({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET });
export const urlFor = (source: Parameters<typeof builder.image>[0]) => builder.image(source);
