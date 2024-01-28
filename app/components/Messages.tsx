'use client'

import { useContext, useEffect, useState } from "react"
import styles from "./messages.module.css"
import { AppContext } from "@/app/page"
import { CombinedMessage } from "@/types/types"

export default function Messages() {
    const context = useContext(AppContext)
    const [messages, setMessages] = useState<CombinedMessage[]>([]);

    useEffect(() => {
        // no channel has been selected yet.
        if (context?.currentChannel?.channel_id === undefined) { return; }
        fetch(`/api/messages?channel_id=${context?.currentChannel?.channel_id}`).then(async res => {
            const json = await res.json()
            console.log(json)
            setMessages(json);
        })
        setMessages(messages)
    }, [context?.currentChannel?.channel_id])

    console.log(context?.currentChannel?.channel_id)

    return (
        <div className={styles.messages}>
            {
                messages && messages.map(
                    (val) => <Message key={val.channel_id} message={val} />
                )
            }
        </div >
    )
}

function Message({ message }: { message: CombinedMessage }) {
    return (
        <p key={message.user.display_name || message.user.username}>{message.content}</p>
    )
}
