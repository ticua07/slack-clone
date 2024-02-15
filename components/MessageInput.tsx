'use client'

import { z } from "zod";
import styles from "./MessageInput.module.css"
import { createClient } from "@/utils/supabase/client";
import { AppContext } from "../app/page";
import { useContext, useRef } from "react";
import { Message } from "@/types/types";

const schema = z.object({
    content: z.string().min(1)
}).required()

export default function MessageInput({ isDm }: { isDm: boolean }) {
    const supabase = createClient()
    const formRef = useRef<HTMLFormElement>(null)
    const context = useContext(AppContext);


    const submitMessage = async (formData: FormData) => {
        'use client'

        const rawFormData = Object.fromEntries(formData.entries())
        const result = schema.safeParse(rawFormData);
        if (!result.success) { return; }

        const content = result.data.content
        if (!isDm) {
            const newMessage = {
                sender_id: context?.user?.id,
                channel_id: context?.currentChannel?.channel_id,
                content,
                is_image: false
            }
            const { error } = await supabase.from("messages").insert(newMessage);
            console.log(error)
        } else {
            console.log(context?.currentDMChannel)
            const newMessage = {
                sender_id: context?.user?.id,
                sent_to_id: context?.currentDMChannel,
                content,
                is_image: false,
            }
            const { error } = await supabase.from("direct_messages").insert(newMessage)
            console.log(error);
        }

        formRef.current?.reset()
    }
    return (
        <form ref={formRef} className={styles.container} action={submitMessage}>
            <input name="content" className={styles.input} type="text" placeholder={context?.currentChannel ? `Message #${context?.currentChannel?.channel_name}` : ""} />
        </form>
    )
}
