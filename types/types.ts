import { Dispatch, SetStateAction } from "react";
import { Database } from "./supabase";

export type Channel = Database['public']['Tables']['channels']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Message = Database['public']['Tables']['messages']['Row']
export type CombinedMessage = Message & { user: Profile };

export type AppContextType = {
    channels: Channel[],
    currentChannel: Channel | undefined,
    setCurrentChannel: Dispatch<SetStateAction<{
        channel_id: string;
        channel_name: string | null;
        created_at: string;
        description: string | null;
    } | undefined>>
}