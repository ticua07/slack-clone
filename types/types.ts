import { Dispatch, SetStateAction } from "react";
import { Database } from "./supabase";
import { User } from "@supabase/supabase-js";

export type Channel = Database["public"]["Tables"]["channels"]["Row"];
export type DirectMessage =
  Database["public"]["Tables"]["direct_messages"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type CombinedMessage = Message & { user: ProfileWithImage };
export type ProfileWithImage = Profile & { pfp: string }

export type AppContextType = {
  channels: Channel[];
  currentChannel: Channel | undefined;
  user: User | undefined;
  profile: ProfileWithImage | null
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
  setIsCurrentChannelDM: Dispatch<SetStateAction<boolean>>;
};
