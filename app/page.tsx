"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createContext } from "react";
import { AppContextType, Channel, DirectMessage, ProfileWithImage } from "@/types/types";

import Sidebar from "@/components/Sidebar";
import Messages from "@/components/Messages";

export const AppContext = createContext<AppContextType | null>(null);

const fetchDms = async (uid: string) => {
  const supabase = createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();

  if (!data) return null;

  const channel: Channel = {
    channel_id: uid,
    channel_name: data.display_name || data.username,
    created_at: data.created_at,
    description: data.description || "",
  };

  return channel;
};

const uniqueDms = async (dms: DirectMessage[], uid: string) => {
  const unique_ids = new Set<string>();

  dms.forEach((el) => {
    unique_ids.add(el.sender_id || "");
    unique_ids.add(el.sent_to_id || "");
  });
  unique_ids.delete(uid);

  let allChannels = await Promise.all(
    Array.from(unique_ids).map(async (id) => await fetchDms(id))
  );

  let channels = allChannels.filter((el) => el !== null) as Channel[];

  return channels;
};

export default function Index() {
  const supabase = createClient();

  const [user, setUser] = useState<User>();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [dmChannels, setDmChannels] = useState<any[]>([]);
  const [isCurrentChannelDM, setIsCurrentChannelDM] = useState(false);
  const [profile, setProfile] = useState<ProfileWithImage | null>(null)

  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.auth.getUser();

      const res = await fetch(`/api/users?id=${data.user?.id}`);
      const json = await res.json();
      setProfile(json);

      const channels = await supabase.from("channels").select("*");
      const dms = await supabase.from("direct_messages").select("*");

      const serversRes = await fetch("/api/servers")
      const serversJson = await serversRes.json()
      setServers(serversJson)
      if (serversJson.length > 0) {
        setCurrentServer(serversJson[0])
      }

      setDmChannels(await uniqueDms(dms.data || [], data.user?.id || ""));
      setUser(data.user as User);
      setChannels(channels.data || []);
      setCurrentChannel(channels.data?.[0] || undefined);
    };
    getData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        servers,
        setServers,
        currentServer,
        setCurrentServer,

        channels,
        user,
        profile,

        currentChannel,
        setCurrentChannel,

        dmChannels,
        setDmChannels,

        isCurrentChannelDM,
        setIsCurrentChannelDM,
      }}
    >
      <main className="flex w-full h-full">
        <Sidebar />
        <Messages />
      </main>
    </AppContext.Provider>
  );
}
