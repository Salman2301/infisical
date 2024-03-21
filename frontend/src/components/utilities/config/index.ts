const ENV = process.env.NEXT_PUBLIC_ENV! || "development"; // investigate
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY!;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST! || "https://app.posthog.com";
const INTERCOMid = process.env.NEXT_PUBLIC_INTERCOMid!;
const SECRET_SHARING_PASSPHRASE = process.env.NEXT_PUBLIC_SECRET_SHARING_PASSPHRASE ||  "os&8UWGgEiuE[KNp5%p1oC";

export { ENV, INTERCOMid, POSTHOG_API_KEY, POSTHOG_HOST, SECRET_SHARING_PASSPHRASE };
