import { createCacheClient } from "@/utils/supabase/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export const revalidate = 120;
export const runtime = "nodejs";
const DEFAULT_USER_IMAGE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=ys"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id !== null && !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ success: false });
  }

  const supabase = createCacheClient();
  const user = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id as string)
    .single();

  if (!user.data) {
    return NextResponse.json({ success: false });
  }

  const { data: files } = await supabase.storage
    .from('photos')
    .list(`pfp`, { sortBy: { column: 'created_at', order: 'desc' }, search: `${id}` });

  let img: string | null = null;

  if (files && files?.length > 0) {
    const latest = files[0]
    img = (await supabase.storage.from("photos").getPublicUrl(`pfp/${latest.name}`)).data?.publicUrl
    return NextResponse.json({ ...user.data, pfp: img });
  }

  return NextResponse.json({ ...user.data, pfp: img || DEFAULT_USER_IMAGE });


}
