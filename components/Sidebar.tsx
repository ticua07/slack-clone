"use client";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/app/page";
import { Channel, Profile } from "@/types/types";
import { createClient } from "@/utils/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";


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
    const buttonStyle = "outline-none border-none text-start text-white py-3 px-4 bg-transparent opacity-90"
    const activeButtonStyle = "bg-neutral-950"
    if (channel_id == context?.currentChannel?.channel_id) {
      return [buttonStyle, activeButtonStyle].join(" ");
    } else {
      return buttonStyle;
    }
  };

  return (
    <section className="flex flex-col justify-between w-full h-screen max-w-72 bg-zinc-800 ">
      <article className="flex flex-col flex-1 w-full">
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
    <footer className="flex items-center justify-between h-16 px-3 bg-neutral-950">
      <div className="flex items-center h-16 gap-4">
        <img
          className="mt-1 max-w-10 max-h-10 rounded-[50%] overflow-hidden"
          src={pfp}
        />

        <div className="flex items-center h-16">
          {profile?.display_name ? (
            <div>
              <p className="text-white">{profile?.display_name}</p>
              <p className="text-white opacity-65">{profile?.username}</p>
            </div>
          ) : (
            <p className="text-white">{profile?.username}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center h-16 gap-5">
        <button className="cursor-pointer" onClick={signOut}>
          <FontAwesomeIcon
            style={{ height: "25px", color: "#aaa" }}
            icon={faArrowRightFromBracket}
          />
        </button>

        <Link href="/profile">
          <FontAwesomeIcon
            style={{ height: "25px", color: "#aaa" }}
            icon={faGear}
          />
        </Link>
      </div>
    </footer>
  );
}
