export const site = {
  name: "Cherry Thrifts",
  tagline: "Pre-loved pieces, hand-picked for their second life.",
  description:
    "Cherry Thrifts is a thrift store for tops, skirts and purses, picked one piece at a time.",
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

// Placeholder copy for the About page. Rewrite it in your own words.
export const about = {
  intro:
    "Cherry Thrifts is a small thrift store for people who love clothes with a little history. We look for tops, long skirts and purses that still have plenty of life in them, and pass them on at prices that make sense.",
  story: [
    "It started with a wardrobe that was too full and a soft spot for a good find. Every piece in the shop is chosen by hand, one at a time, because it is well made, easy to wear, or simply too pretty to leave behind.",
    "Thrifting keeps good clothes in use for longer, and it means your outfit is unlikely to turn up on anyone else. Most pieces are one of a kind, so when something is gone, it is gone.",
  ],
  values: [
    {
      title: "Hand-picked",
      text: "Nothing is bought in bulk. Each piece is chosen on its own merits.",
    },
    {
      title: "Honestly described",
      text: "Every listing gives the size and condition, including any flaws.",
    },
    {
      title: "Worn again",
      text: "Buying second-hand gives a good piece another life.",
    },
  ],
};

export type BlogPost = {
  title: string;
  date: string;
  excerpt: string;
  url: string;
};

// Posts listed on /blog. Each entry links out to wherever the post lives.
export const blogPosts: BlogPost[] = [];
