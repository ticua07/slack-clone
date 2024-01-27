import { createCacheClient } from "@/utils/supabase/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const channel_id = searchParams.get('channel_id')

    if (channel_id !== null && !z.string().uuid().safeParse(channel_id).success) {
        return NextResponse.json({ success: false })
    }

    const supabase = createClient(cookies());
    const supabaseCached = createCacheClient();

    const messages = await supabase.from("messages").select("*").eq("channel_id", channel_id as string);
    if (!messages.data) { return NextResponse.json({ success: false }) }

    const messagesWithUser = await Promise.all(messages.data.map(async (message) => {
        const user = await supabaseCached.from("profiles").select("*").eq("id", message.sender_id as string).single();

        if (!user.data) {
            return {
                // Deleted user placeholder
                user: { id: null, username: "Deleted User", display_name: "Deleted User" },
                ...message
            }
        }

        return { user: user.data, ...message };
    }));

    return NextResponse.json(messagesWithUser)
}