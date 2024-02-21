"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "@/app/page";
import { AppContextType, CombinedMessage, Message, Profile } from "@/types/types";
import MessageInput from "./MessageInput";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_USER_IMAGE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=ys"

export default function Messages({ isDM }: { isDM: boolean }) {
  const supabase = createClient();
  const context = useContext(AppContext);
  const message_list = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<CombinedMessage[]>([]);
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
        await fetch(`/api/users?id=${dm.sender_id}`)
      ).json()) as Profile;

      const combined = { ...dm, user } as CombinedMessage;
      return combined;
    });

    const dmsWithUser = await Promise.all(dmsWithUserPromise);

    setMessages(dmsWithUser);
    setLoading(false)
  };

  useEffect(() => {
    setMessages([]);

    if (context?.currentChannel?.channel_id === undefined) {
      return;
    }

    const getMessages = async () => {
      // Fetch DMs or messages based on if we're on a public channel or private conversation
      // After that, listen for changes
      context?.isCurrentChannelDM ? await fetchDMs() : await fetchMessages();

      supabase
        .channel("direct_messages")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: context?.isCurrentChannelDM ? "direct_messages" : "messages" },
          async () => await (context?.isCurrentChannelDM ? fetchDMs() : fetchMessages())
        )
        .subscribe();
    };
    getMessages();

  }, [context?.currentChannel, context?.isCurrentChannelDM]);

  useEffect(() => {
    // scroll to last message if exists
    if (message_list.current) {
      message_list.current.scrollTop = message_list.current.scrollHeight;
    }

    //https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
    // previously I used justify-content: flex-end to bring the messages to the bottom
    // that overrides the scrollbar so to have messages in the bottom we have to add margin-top: auto to first element

    const firstMessage = message_list.current?.childNodes[0];
    if (firstMessage instanceof HTMLElement) {
      firstMessage.classList.add("mt-auto")
    }
  }, [messages]);

  return (
    <section className="flex flex-col w-full h-screen">
      <Header />
      <section className="flex flex-col h-full pb-2 pl-2 mt-auto overflow-y-scroll" ref={message_list}>
        {loading ? (
          <p>Loading messages...</p>
        )
          : messages.map((val) => <Message key={val.id} message={val} supabase={supabase} context={context} />)
        }
      </section>
      {context?.isCurrentChannelDM ? <MessageInput isDm={true} /> : <MessageInput isDm={false} />}
    </section>
  );
}

function Message({ message, supabase, context }: { message: CombinedMessage, supabase: SupabaseClient, context: AppContextType | null }) {
  const [image, setImage] = useState<string | null>(null)
  const [contentImg, setContentImg] = useState<string | null>(null)
  const [imgLoading, setImgLoading] = useState(true);

  const getDate = useMemo(() => {
    const date = new Date(message.created_at)
    const day = date.getDate()
    const month = date.getMonth() + 1;
    const year = date.getFullYear()
    const hour = date.getHours()
    const minute = date.getMinutes()

    const formattedDay = day < 10 ? `0${day}` : day
    const formattedMonth = month < 10 ? `0${month}` : month

    return `${formattedDay}/${formattedMonth}/${year} ${hour}:${minute}`
  }, [message.created_at])

  const loadingStyle = () => {
    return `${imgLoading ? "opacity-0 h-64" : "opacity-100 max-h-64"} transition-opacity duration-200`
  }

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch(`/api/pfp?id=${message.user.id}`)
      const json = await res.json();
      if (json.success) {
        setImage(json.url)
      } else {
        setImage(null)
      }

      if (message.is_image) {
        const img = (await supabase.storage.from("photos").createSignedUrl(message.content || "", 60 * 24)).data?.signedUrl
          || DEFAULT_USER_IMAGE;
        setContentImg(img)
      }
    }
    getUser()
  }, [])

  return (
    <article className="flex gap-2 p-1">
      <img
        className="mt-1 max-w-10 max-h-10 rounded-[50%]"
        src={image || DEFAULT_USER_IMAGE}
        alt="profile"
      />
      <section>
        <div className="flex flex-row items-baseline gap-2">
          {
            message.sender_id !== null
              ? <a className="text-base font-bold" onClick={() => {
                context?.setIsCurrentChannelDM(true);
                context?.setCurrentDmChannel(message.sender_id!)
              }}>{message.user.display_name || message.user.username}</a>
              : <p className="text-base font-bold">{message.user.display_name || message.user.username}</p>
          }
          <p className="text-sm">{getDate}</p>
        </div>

        {!message.is_image
          ? <p className="break-words whitespace-normal">{message.content}</p>
          : <img className={loadingStyle()} src={contentImg || ""} onLoad={() => setImgLoading(false)} />
        }
      </section>
    </article>
  );
}


function Header() {
  const context = useContext(AppContext);

  return (
    context?.currentChannel && (
      <nav className="flex items-center h-12 gap-6 pl-2 border-b border-gray-450">
        <p className="text-xl font-semibold">
          #{context?.currentChannel?.channel_name}
        </p>
        <p className="font-normal text-md opacity-80">
          {context?.currentChannel?.description}
        </p>
      </nav>
    )
  );
}
