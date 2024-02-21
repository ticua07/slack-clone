'use client'

import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { AppContext } from "../app/page";
import { ChangeEvent, useContext, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { nanoid } from "nanoid";

const IMAGE_RANDOM_CHARS = 32
const schema = z.object({
    content: z.string().min(1)
}).required()

export default function MessageInput({ isDm }: { isDm: boolean }) {
    const supabase = createClient()
    const formRef = useRef<HTMLFormElement>(null)
    const context = useContext(AppContext);

    const sendMessage = async (content: string, img: boolean) => {
        const newMessage = {
            sender_id: context?.user?.id,
            channel_id: isDm ? context?.currentDMChannel : context?.currentChannel?.channel_id,
            content,
            is_image: img,
        }
        const { error } = await supabase.from(isDm ? "direct_messages" : "messages").insert(newMessage);
        console.log(error)
    }

    const submitMessage = async (formData: FormData) => {
        'use client'

        const rawFormData = Object.fromEntries(formData.entries())
        const result = schema.safeParse(rawFormData);
        if (!result.success) return;

        const content = result.data.content
        await sendMessage(content, false)

        formRef.current?.reset()
    }

    const uploadImg = async (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        const file = e.currentTarget.files;
        if (file && file?.[0] !== null) {
            const random_slug = nanoid(IMAGE_RANDOM_CHARS);
            const name = `content/${random_slug}`

            const { error } = await supabase.storage.from("photos").upload(name, file[0])
            await sendMessage(name, true)

            if (error) {
                console.log(error)
            }
        }
    }

    return (
        <form ref={formRef} className="flex flex-row p-1 pr-4 h-14 divide-zinc-400" action={submitMessage} >
            <label className="flex items-center justify-center w-12 h-full border rounded-l-md border-zinc-400">
                <input type="file" className="hidden" onChange={uploadImg} />
                <FontAwesomeIcon icon={faFileArrowUp} style={{ height: "25px", color: "#555" }} />
            </label>
            <input name="content" className="w-full h-full pl-2 border-t border-b border-zinc-400" type="text" placeholder={context?.currentChannel ? `Message #${context?.currentChannel?.channel_name}` : ""} />

            <button className="flex items-center justify-center w-12 h-full border rounded-r-md border-zinc-400">
                <FontAwesomeIcon icon={faPaperPlane} style={{ height: "25px", color: "#555" }} />
            </button>
        </form>
    )
}
