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
    <div className={styles.sidebar}>
      <div className={styles.sidebar_items}>
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
            #{val.channel_name}
          </button>
        ))}
      </div>
      <UserDisplay />
    </div>
  );
}

function UserDisplay() {
  const context = useContext(AppContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  useEffect(() => {
    const getData = async () => {
      if (!context) {
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", context.user?.id || "")
        .single();
      setProfile(data);
    };
    getData();
  }, [context?.user]);

  return (
    <div className={styles.user_container}>
      <div className={styles.data}>
        <img
          className={styles.pfp}
          src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=y"
        />
        <div className={styles.user_data}>
          {profile?.display_name ? (
            <>
              <p className={styles.text}>{profile?.display_name}</p>
              <p className={styles.text_secondary}>{profile?.username}</p>
            </>
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
    </div>
  );
}
