'use client'

import { useContext, useEffect, useRef, useState } from "react"
import styles from "./messages.module.css"
import { AppContext } from "@/app/page"
import { CombinedMessage } from "@/types/types"
import MessageInput from "./MessageInput"
import { createClient } from "@/utils/supabase/client"

export default function Messages() {
    const supabase = createClient();
    const context = useContext(AppContext)
    const [messages, setMessages] = useState<CombinedMessage[]>([]);
    const message_list = useRef<HTMLDivElement>(null);

    const fetchMessages = () => {
        fetch(`/api/messages?channel_id=${context?.currentChannel?.channel_id}`)
            .then(async res => {
                const json = await res.json();
                setMessages(json);
            })
            .catch(error => {
                console.error("Error fetching messages:", error);
                setMessages([]); // Set messages to empty array in case of an error
            });
    }

    useEffect(() => {
        setMessages([]); // Set messages to empty array when starting the fetch
        if (context?.currentChannel?.channel_id === undefined) { return; }

        fetchMessages()

        supabase.channel("messages").on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: "messages" },
            () => fetchMessages()
        ).subscribe()


    }, [context?.currentChannel]);

    useEffect(() => {
        if (message_list.current) {
            message_list.current.scrollTop = message_list.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={styles.messages_container}>
            <Header />
            <div className={styles.messages} ref={message_list}>
                {
                    messages.length !== 0 ? messages.map(
                        (val) => (
                            <Message key={val.id} message={val} />
                        )
                    ) : <p>Loading messages...</p>
                }
            </div>
            <div>
                <MessageInput />
            </div>
        </div>
    )
}

function Message({ message }: { message: CombinedMessage }) {
    return (
        <div key={message.id} className={styles.container}>
            <img className={styles.pfp} src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=y" alt="profile" />
            <div>
                <div className={styles.message_data}>
                    <p className={styles.name}>{message.user.display_name}</p>
                    <p className={styles.message_date}>{message.created_at}</p>
                </div>

                <p className={styles.message_content}>
                    {message.content}
                </p>
            </div>
        </div>
    )
}

function Header() {
    const context = useContext(AppContext)

    return (
        <>
            {context?.currentChannel &&
                <div className={styles.header}>
                    <p className={styles.title}>#{context?.currentChannel?.channel_name}</p>
                    <p className={styles.channel_description}>{context?.currentChannel?.description}</p>
                </div>
            }
        </>
    )
}
