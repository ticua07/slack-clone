'use client'

import styles from "./sidebar.module.css"
import { useContext } from "react";
import { AppContext } from "@/app/page";
import { Channel } from "@/types/types";

export default function Sidebar() {
    const context = useContext(AppContext);

    const changeChannel = (channel: Channel) => {
        if (channel.channel_id == context?.currentChannel?.channel_id) { return; }
        console.log(context?.currentChannel)
        context?.setCurrentChannel(channel);
    }

    return (
        <div className={styles.sidebar}>
            {context?.channels.map(val =>
                <a
                    role="button"
                    onClick={() => changeChannel(val)}
                    key={val.channel_id}>
                    {val.channel_name} - {val.description}
                </a>
            )}
        </div >
    )
}
