"use client";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/app/page";
import { Channel, Profile } from "@/types/types";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";


export default function Sidebar() {
  const context = useContext(AppContext);

  const changeChannel = (channel: Channel) => {
    if (channel.channel_id == context?.currentChannel?.channel_id) {
      return;
    }
    context?.setCurrentChannel(channel);
    context?.setIsCurrentChannelDM(false);
  };

  const changeToDM = (channel: Channel) => {
    if (channel.channel_id == context?.currentChannel?.channel_id) {
      return;
    }

    context?.setIsCurrentChannelDM(true);
    context?.setCurrentChannel(channel)
  };

  const styleIfActive = (channel_id: String) => {
    const buttonStyle = "outline-none border-none text-start px-4 h-12 opacity-70 font-medium hover:opacity-90 hover:bg-gray-100"
    const activeButtonStyle = "bg-gray-100 !opacity-100"
    if (channel_id == context?.currentChannel?.channel_id) {
      return [activeButtonStyle, buttonStyle].join(" ");
    } else {
      return buttonStyle;
    }
  };

  return (
    <section className="flex flex-col justify-between w-full h-screen border-r max-w-72 border-zinc-200">
      <article className="flex flex-col flex-1 w-full gap-1">
        <h1 className="pl-4 my-2 text-lg">Canales</h1>
        {context?.channels.map((val) => (
          <button
            className={styleIfActive(val.channel_id)}
            onClick={() => changeChannel(val)}
            key={val.channel_id}
          >
            #{val.channel_name}
          </button>
        ))}

        <hr />

        <h1 className="pl-4 my-2 text-lg">Mensajes privados</h1>
        {context?.dmChannels.map((val) => (
          <button
            className={styleIfActive(val.channel_id)}
            onClick={() => changeToDM(val)}
            key={val.channel_id}
          >
            {val.channel_name}
          </button>
        ))}
      </article>

      <UserDisplay />
    </section>
  );
}

const DEFAULT_USER_IMAGE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=ys"

function UserDisplay() {
  const context = useContext(AppContext);
  const supabase = createClient();
  const router = useRouter();
  const [pfp, setPfp] = useState(DEFAULT_USER_IMAGE)
  const [profile, setProfile] = useState<Profile | null>(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  useEffect(() => {
    const getData = async () => {
      if (!context?.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", context.user?.id || "")
        .single();
      setProfile(data);

      const res = await fetch(`/api/pfp?id=${context.user?.id}`)
      const json = await res.json()
      setPfp(json.url)
    };
    getData();
  }, [context?.user]);

  return (
    <footer className="flex items-center justify-between h-16 px-3 bg-zinc-100">
      <div className="flex items-center h-16 gap-4">
        <img
          className="mt-1 max-w-10 max-h-10 rounded-[50%] overflow-hidden"
          src={pfp}
        />

        <div className="flex items-center h-16">
          {profile?.display_name ? (
            <div>
              <p>{profile?.display_name}</p>
              <p className="opacity-65">{profile?.username}</p>
            </div>
          ) : (
            <p>{profile?.username}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center h-16 gap-5">
        <button className="cursor-pointer" onClick={signOut}>
          <LogOut color="#555" />
        </button>

        <Link href="/profile">
          <Settings color="#555" />
        </Link>
      </div>
    </footer>
  );
}
