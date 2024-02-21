'use client'

import { z } from "zod";
import styles from "./MessageInput.module.css"
import { createClient } from "@/utils/supabase/client";
import { AppContext } from "../app/page";
import { ChangeEvent, useContext, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
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
        // send message to appropiate db wether we are on DMs or not
        if (!isDm) {
            const newMessage = {
                sender_id: context?.user?.id,
                channel_id: context?.currentChannel?.channel_id,
                content,
                is_image: img
            }
            const { error } = await supabase.from("messages").insert(newMessage);
            console.log(error)
        } else {
            console.log(context?.currentDMChannel)
            const newMessage = {
                sender_id: context?.user?.id,
                sent_to_id: context?.currentDMChannel,
                content,
                is_image: img,
            }
            const { error } = await supabase.from("direct_messages").insert(newMessage)
            console.log(error);
        }
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
        <form ref={formRef} className={styles.container} action={submitMessage} >
            <label className={`${styles.input} ${styles.button}`}>
                <input type="file" className={styles.file} onChange={uploadImg} />
                <FontAwesomeIcon icon={faFileArrowUp} style={{ height: "25px", color: "#555" }} />
            </label>
            <input name="content" className={styles.input} type="text" placeholder={context?.currentChannel ? `Message #${context?.currentChannel?.channel_name}` : ""} />
        </form>
    )
}
