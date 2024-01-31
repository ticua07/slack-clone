'use client'

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import styles from "./main.module.css"
import { createContext } from "react";
import Sidebar from "@/components/Sidebar";
import { AppContextType, Channel } from "@/types/types";
import Messages from "@/components/Messages";

export const AppContext = createContext<AppContextType | null>(null)

export default function Index() {
    const supabase = createClient();
    const [user, setUser] = useState<User>();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [currentChannel, setCurrentChannel] = useState<Channel>();

    useEffect(() => {
        const getData = async () => {
            const { data } = await supabase.auth.getUser();
            const channels = await supabase.from("channels").select("*");

            setUser(data.user as User)
            setChannels(channels.data || [])
            setCurrentChannel(channels.data?.[0] || undefined);
        }
        getData()
    }, [])

    return (
        <AppContext.Provider value={{ channels, user, currentChannel, setCurrentChannel }}>
            <div className={styles.container}>
                <Sidebar />
                <Messages />
            </div>
        </AppContext.Provider >
    );
}
