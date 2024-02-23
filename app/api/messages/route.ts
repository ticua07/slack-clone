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

        const { data: files } = await supabase.storage
            .from('photos')
            .list(`pfp`, { sortBy: { column: 'created_at', order: 'desc' }, search: `${message.sender_id}` });

        let pfpUrl = "";

        if (files && files?.length > 0) {
            const latest = files[0]
            pfpUrl = (await supabase.storage.from("photos").getPublicUrl(`pfp/${latest.name}`)).data?.publicUrl
        }

        if (message.is_image) {
            const imgContent = await supabase.storage.from("photos").getPublicUrl(message.content!).data.publicUrl;
            message = {
                ...message,
                content: imgContent,
            }
        }

        return { user: { ...user.data, pfp: pfpUrl }, ...message };
    }));

    return NextResponse.json(messagesWithUser)
}