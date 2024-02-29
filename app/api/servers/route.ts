import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabase = createClient(cookies());

    const { data } = await supabase.from("servers").select("*");
    if (data) {
        return NextResponse.json(data)
    } else {
        return NextResponse.json({ success: false })
    }
}