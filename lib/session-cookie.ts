// The cookie that keeps a shopper signed in. Its own file so the proxy can
// check for it without loading the database code.
export const SESSION_COOKIE = "cherry-thrifts-session";

// The admin panel's own sign-in, separate from shoppers'. Only sent to /admin.
export const ADMIN_COOKIE = "cherry-thrifts-admin";
