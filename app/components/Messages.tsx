'use client'

import { useContext, useEffect, useState } from "react"
import styles from "./messages.module.css"
import { AppContext } from "@/app/page"
import { CombinedMessage } from "@/types/types"

export default function Messages() {
    const context = useContext(AppContext)
    const [messages, setMessages] = useState<CombinedMessage[]>([]);

    useEffect(() => {
        setMessages([]); // Set messages to empty array when starting the fetch
        if (context?.currentChannel?.channel_id === undefined) { return; }

        fetch(`/api/messages?channel_id=${context?.currentChannel?.channel_id}`)
            .then(async res => {
                const json = await res.json();
                setMessages(json);
            })
            .catch(error => {
                console.error("Error fetching messages:", error);
                setMessages([]); // Set messages to empty array in case of an error
            });
    }, [context?.currentChannel]);

    return (
        <div className={styles.messages}>
            {
                messages.length !== 0 ? messages.map(
                    (val) => <Message key={val.channel_id} message={val} />
                ) : <p>Loading messages...</p>
            }
        </div >
    )
}

function Message({ message }: { message: CombinedMessage }) {
    return (
        <div className={styles.container}>
            <img className={styles.pfp} src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=y" alt="profile" />
            <div>
                <div className={styles.message_data}>
                    <p>{message.user.display_name}</p>
                    <p className={styles.message_date}>{message.created_at}</p>
                </div>

                <p className={styles.message_content}>
                    {message.content}
                </p>
            </div>
        </div>
    )
}
