import { Dispatch, SetStateAction } from "react";
import { Database } from "./supabase";
import { User } from "@supabase/supabase-js";

export type Channel = Database["public"]["Tables"]["channels"]["Row"];
export type DirectMessage =
  Database["public"]["Tables"]["direct_messages"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type CombinedMessage = Message & { user: Profile };

export type AppContextType = {
  channels: Channel[];
  currentChannel: Channel | undefined;
  user: User | undefined;
  setCurrentChannel: Dispatch<
    SetStateAction<
      | {
        channel_id: string;
        channel_name: string | null;
        created_at: string;
        description: string | null;
      }
      | undefined
    >
  >;
  dmChannels: Channel[];
  setDmChannels: Dispatch<SetStateAction<any[]>>;
  isCurrentChannelDM: boolean;
  currentDMChannel: Channel | null;
  setCurrentDmChannel: Dispatch<SetStateAction<Channel | null>>
  setIsCurrentChannelDM: Dispatch<SetStateAction<boolean>>;
};
