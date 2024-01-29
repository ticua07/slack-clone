import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";

// a cache of 30s should be enough to when messages are loaded
// we don't repeat the same user info request twice
const REVALIDATE_TIME = 60

const createFetch =
    (options: Pick<RequestInit, "next" | "cache">) =>
        (url: RequestInfo | URL, init?: RequestInit) => {
            return fetch(url, {
                ...init,
                ...options,
            });
        };

// this clients runs on the anon_key only
// made specifically for the users/ route
export const createCacheClient = () =>
    createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                fetch: createFetch({
                    next: {
                        revalidate: REVALIDATE_TIME,
                    },
                }),
            },
        }
    )


