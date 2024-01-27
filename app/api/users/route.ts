import { createCacheClient } from "@/utils/supabase/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export const revalidate = 120;
export const runtime = 'nodejs'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id !== null && !z.string().uuid().safeParse(id).success) {
        return NextResponse.json({ success: false })
    }

    const supabase = createCacheClient();
    const user = await supabase.from("profiles").select("*").eq("id", id as string).single()

    if (!user.data) { return NextResponse.json({ success: false }) }

    return NextResponse.json({ ...user.data, time: Date.now() });
}