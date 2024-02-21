import { createCacheClient } from "@/utils/supabase/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export const revalidate = 120;
export const runtime = "nodejs";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id !== null && !z.string().uuid().safeParse(id).success) {
        return NextResponse.json({ success: false });
    }

    const supabase = createCacheClient();

    const { data: files } = await supabase.storage
        .from('photos')
        .list(`pfp`, { sortBy: { column: 'created_at', order: 'desc' }, search: `${id}` });

    if (files && files?.length > 0) {
        const latest = files[0]
        const img = (await supabase.storage.from("photos").getPublicUrl(`pfp/${latest.name}`)).data?.publicUrl
        return NextResponse.json({ success: true, url: img });
    }
    return NextResponse.json({ success: false });

}
