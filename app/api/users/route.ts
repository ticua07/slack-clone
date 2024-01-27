import { Database } from "@/types/supabase";
import { createCacheClient } from "@/utils/supabase/cache";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

export const revalidate = 120;
export const runtime = 'nodejs'

export async function GET(request: Request) {
    const supabase = createCacheClient();

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id !== null && !z.string().uuid().safeParse(id).success) {
        return NextResponse.json({ success: false })
    }

    const user = await supabase.from("profiles").select("*").eq("id", id as string).single()

    if (!user.data) { return NextResponse.json({ success: false }) }

    return NextResponse.json({ ...user.data, time: Date.now() });

    // if (user.data === null) { return NextResponse.json({ success: false }) }

}