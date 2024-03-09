import { compareDates } from "@/utils/sortByDate";
import { createCacheClient } from "@/utils/supabase/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('me')
    const other_id = searchParams.get("other")

    if (user_id !== null && !z.string().uuid().safeParse(user_id).success) {
        return NextResponse.json({ success: false })
    }
    if (other_id !== null && !z.string().uuid().safeParse(other_id).success) {
        return NextResponse.json({ success: false })
    }

    const supabase = createClient(cookies());
    const supabaseCached = createCacheClient();

    let query1 = `and(sender_id.eq.${user_id},sent_to_id.eq.${other_id})`
    let query2 = `and(sender_id.eq.${other_id},sent_to_id.eq.${user_id})`

    let messages = await supabase
        .from("direct_messages")
        .select("*")
        .or(`or(${query1},${query2})`)

    if (!messages.data) { return NextResponse.json({ success: false }) }

    let messagesWithUser = await Promise.all(messages.data.map(async (message) => {
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

    return NextResponse.json(messagesWithUser.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()))
}