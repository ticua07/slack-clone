'use client'

import styles from "./sidebar.module.css"
import { useContext } from "react";
import { AppContext } from "@/app/page";

export default function Sidebar() {
    const context = useContext(AppContext);

    return (
        <div className={styles.sidebar}>
            {context?.channels.map((val) => <p key={val.channel_id}>{val.channel_name} - {val.description}</p>)}
        </div >
    )
}
