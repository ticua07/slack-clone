"use client";

import { useContext, useEffect, useRef, useState } from "react";
import styles from "./messages.module.css";
import { AppContext } from "@/app/page";
import { AppContextType, CombinedMessage, Message, Profile } from "@/types/types";
import MessageInput from "./MessageInput";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient, User } from "@supabase/supabase-js";

export default function Messages({ isDM }: { isDM: boolean }) {
  const supabase = createClient();

  const context = useContext(AppContext);
  const [messages, setMessages] = useState<CombinedMessage[]>([]);
  const message_list = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    let res = await fetch(
      `/api/messages?channel_id=${context?.currentChannel?.channel_id}`
    );

    const json = await res.json();
    setMessages(json);
    setLoading(false)
  };

  const fetchDMs = async () => {
    let query1 = `and(sender_id.eq.${context?.user?.id},sent_to_id.eq.${context?.currentDMChannel})`
    let query2 = `and(sender_id.eq.${context?.currentDMChannel},sent_to_id.eq.${context?.user?.id})`


    let { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`or(${query1},${query2})`)



    let dms: Message[] = data?.map((dm) => ({ ...dm, channel_id: null })) || [];

    const dmsWithUserPromise = dms?.map(async (dm) => {
      const user = (await (
        await fetch(`/api/users?id=${context?.currentDMChannel}`)
      ).json()) as Profile;


      const combined = { ...dm, user } as CombinedMessage;
      return combined;
    });

    const dmsWithUser = await Promise.all(dmsWithUserPromise);

    setMessages(dmsWithUser);
    setLoading(false)
  };

  useEffect(() => {
    setMessages([]); // Set messages to empty array when starting the fetch
    if (context?.currentChannel?.channel_id === undefined) {
      return;
    }

    const getMessages = async () => {
      if (context?.isCurrentChannelDM) {
        await fetchDMs();
        supabase
          .channel("direct_messages")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "direct_messages" },
            async () => await fetchDMs()
          )
          .subscribe();
      } else {
        await fetchMessages();

        supabase
          .channel("messages")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages" },
            async () => await fetchMessages()
          )
          .subscribe();
      }
    };

    getMessages();

  }, [context?.currentChannel, context?.isCurrentChannelDM]);

  useEffect(() => {
    if (message_list.current) {
      message_list.current.scrollTop = message_list.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.messages_container}>
      <Header />
      <div className={styles.messages} ref={message_list}>
        {!loading ? (
          messages.map((val) => <Message key={val.id} message={val} supabase={supabase} context={context} />)
        ) : (
          <p>Loading messages...</p>
        )}
      </div>
      <div>
        {context?.isCurrentChannelDM ? <MessageInput isDm={true} /> : <MessageInput isDm={false} />}
      </div>
    </div>
  );
}

function Message({ message, supabase, context }: { message: CombinedMessage, supabase: SupabaseClient, context: AppContextType | null }) {
  const [image, setImage] = useState<string | null>(null)


  useEffect(() => {
    const getUser = async () => {
      const { data: files } = await supabase.storage
        .from('photos')
        .list(`pfp`, { sortBy: { column: 'created_at', order: 'desc' }, search: `${message.user.id}` });

      if (files && files?.length > 0) {
        const latest = files[0]
        const img = (await supabase.storage.from("photos").createSignedUrl(`pfp/${latest.name}`, 60 * 24)).data?.signedUrl
        setImage(img || null)

      }
    }
    getUser()
  }, [])

  return (
    <div key={message.id} className={styles.container}>
      <img
        className={styles.pfp}
        src={image || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=ys"}
        alt="profile"
      />
      <div>
        <div className={styles.message_data}>
          <a className={styles.name} onClick={() => {
            context?.setIsCurrentChannelDM(true);
            context?.setCurrentDmChannel(message.sender_id)
          }}>
            {message.user.display_name || message.user.username}
          </a>
          <p className={styles.message_date}>{message.created_at}</p>
        </div>

        <p className={styles.message_content}>{message.content}</p>
      </div>
    </div>
  );
}

function Header() {
  const context = useContext(AppContext);

  return (
    <>
      {context?.currentChannel && (
        <div className={styles.header}>
          <p className={styles.title}>
            #{context?.currentChannel?.channel_name}
          </p>
          <p className={styles.channel_description}>
            {context?.currentChannel?.description}
          </p>
        </div>
      )}
    </>
  );
}
