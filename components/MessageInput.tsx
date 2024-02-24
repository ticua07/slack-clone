'use client'

import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { AppContext } from "../app/page";
import { ChangeEvent, useContext, useRef } from "react";
import { nanoid } from "nanoid";
import { Send, Upload } from "lucide-react";
import { CombinedMessage } from "@/types/types";

type Message = {
    content: string,
    is_image: boolean,
    sender_id: string,
    sent_to_id?: string
    channel_id?: string
}

const IMAGE_RANDOM_CHARS = 32
const schema = z.object({
    content: z.string().min(1)
}).required()

type Props = {
    isDm: boolean,
    addMessageClientSide: (message: CombinedMessage) => void
}


export default function MessageInput({ isDm, addMessageClientSide }: Props) {
    const supabase = createClient()
    const formRef = useRef<HTMLFormElement>(null)
    const context = useContext(AppContext);


    const sendMessage = async (content: string, img: boolean) => {
        let newMessage = {
            content,
            is_image: img
        } as Message;

        if (isDm) {
            newMessage = {
                ...newMessage,
                sent_to_id: context?.currentChannel!.channel_id,
                sender_id: context?.user?.id!,
            }
        } else {
            newMessage = {
                ...newMessage,
                channel_id: context?.currentChannel?.channel_id,
                sender_id: context?.user?.id!,
            }

            // add fake message until message gets sent
            addMessageClientSide({
                ...newMessage,
                id: crypto.randomUUID(),
                channel_id: context?.currentChannel?.channel_id || null,
                created_at: new Date(Date.now()).toISOString(),
                user: context?.profile!
            })
        }
        const { error } = await supabase.from(isDm ? "direct_messages" : "messages").insert(newMessage)
        console.log(error);
    }

    const submitMessage = async (formData: FormData) => {
        'use client'

        const rawFormData = Object.fromEntries(formData.entries())
        const result = schema.safeParse(rawFormData);
        if (!result.success) return;

        const content = result.data.content
        if (content.trim().length > 0) {
            await sendMessage(content, false)
            formRef.current?.reset()
        }
    }

    const uploadImg = async (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        const file = e.currentTarget.files;
        if (file && file?.[0] !== null) {
            const random_slug = nanoid(IMAGE_RANDOM_CHARS);
            const name = `content/${random_slug}`

            const { error } = await supabase.storage.from("photos").upload(name, file[0])

            if (error) {
                console.log(error)
            } else {
                await sendMessage(name, true)
            }
        }
    }

    return (
        <form ref={formRef} className="flex flex-row p-1 pr-4 divide-gray-300 h-14" action={submitMessage} >
            <label className="flex items-center justify-center w-12 h-full border border-gray-300 cursor-pointer rounded-l-md ">
                <input type="file" className="hidden" onChange={uploadImg} />
                <Upload color="#555" />
            </label>
            <input name="content" className="w-full h-full pl-2 border-t border-b" type="text" placeholder={context?.currentChannel ? `Message #${context?.currentChannel?.channel_name}` : ""} />

            <button className="flex items-center justify-center w-12 h-full border border-gray-300 rounded-r-md">
                <Send color="#555" />
            </button>
        </form>
    )
}
