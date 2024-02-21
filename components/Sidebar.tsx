"use client";

import styles from "./sidebar.module.css";
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
    context?.setCurrentDmChannel(channel.channel_id)
  };

  const styleIfActive = (channel_id: String) => {
    if (channel_id == context?.currentChannel?.channel_id) {
      return [styles.button, styles.button_active].join(" ");
    } else {
      return styles.button;
    }
  };

  return (
    <section className={styles.sidebar}>
      <article className={styles.sidebar_items}>
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
      if (!context) return;

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
    <footer className={styles.user_container}>
      <div className={styles.data}>
        <img
          className={styles.pfp}
          src={pfp}
        />

        <div className={styles.user_data}>
          {profile?.display_name ? (
            <div>
              <p className={styles.text}>{profile?.display_name}</p>
              <p className={styles.text_secondary}>{profile?.username}</p>
            </div>
          ) : (
            <p className={styles.text}>{profile?.username}</p>
          )}
        </div>
      </div>

      <div className={styles.icons}>
        <button className={styles.logout} onClick={signOut}>
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
