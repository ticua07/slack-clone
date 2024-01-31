'use client'

import { z } from "zod";
import styles from "./MessageInput.module.css"
import { createClient } from "@/utils/supabase/client";
import { AppContext } from "../page";
import { useContext, useRef } from "react";
import { Message } from "@/types/types";

const schema = z.object({
    content: z.string()
}).required()

export default function MessageInput() {
    const supabase = createClient()
    const formRef = useRef<HTMLFormElement>(null)
    const context = useContext(AppContext);

    const submitMessage = async (formData: FormData) => {
        'use client'

        const rawFormData = Object.fromEntries(formData.entries())
        const result = schema.safeParse(rawFormData);
        if (!result.success) { return; }

        const content = result.data.content
        const newMessage = {
            sender_id: context?.user?.id,
            channel_id: context?.currentChannel?.channel_id,
            content,
            is_image: false
        }
        const { error } = await supabase.from("messages").insert(newMessage);
        console.log(error)
        formRef.current?.reset()
    }
    return (
        <form ref={formRef} className={styles.container} action={submitMessage}>
            <input name="content" className={styles.input} type="text" placeholder={context?.currentChannel ? `Message #${context?.currentChannel?.channel_name}` : ""} />
        </form>
    )
}
