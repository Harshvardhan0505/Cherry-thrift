export const site = {
  name: "Cherry Thrifts",
  tagline: "Pre-loved pieces, hand-picked for their second life.",
  description:
    "Cherry Thrifts is a thrift store for tops, skirts, purses and jeans, picked one piece at a time.",
  contact: {
    name: "Harshvardhan",
    email: "harshvardhan.h145@gmail.com",
  },
  instagram: {
    handle: "@_cherry.thrifts_",
    url: "https://www.instagram.com/_cherry.thrifts_?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw==",
  },
  // Where the "Blog" links point. Swap for an external URL to send visitors
  // straight to a blog hosted elsewhere.
  blogUrl: "/blog",
};

export type BlogPost = {
  title: string;
  date: string;
  excerpt: string;
  url: string;
};

// Posts listed on /blog. Each entry links out to wherever the post lives.
export const blogPosts: BlogPost[] = [];
