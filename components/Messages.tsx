"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "@/app/page";
import { AppContextType, CombinedMessage, Message, Profile } from "@/types/types";
import MessageInput from "./MessageInput";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'


const DEFAULT_USER_IMAGE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=ys"

export default function Messages() {
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
    let query1 = `and(sender_id.eq.${context?.user?.id},sent_to_id.eq.${context?.currentChannel?.channel_id})`
    let query2 = `and(sender_id.eq.${context?.currentChannel?.channel_id},sent_to_id.eq.${context?.user?.id})`

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


    const firstMessage = message_list.current?.childNodes[0];

    if (firstMessage instanceof HTMLElement) {
      //https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
      // previously I used justify-content: flex-end to bring the messages to the bottom
      // that overrides the scrollbar so to have messages in the bottom we have to add margin-top: auto to first element
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
      <MessageInput isDm={context?.isCurrentChannelDM!} />
    </section>
  );
}

function Message({ message, supabase, context }: { message: CombinedMessage, supabase: SupabaseClient, context: AppContextType | null }) {
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

  return (
    <article className="flex gap-2 p-1">
      <img
        className="mt-1 max-w-10 max-h-10 rounded-[50%]"
        src={message.user.pfp || DEFAULT_USER_IMAGE}
        alt="profile"
      />
      <section>
        <div className="flex flex-row items-baseline gap-2 ">
          {
            message.sender_id !== null
              ? <a className="font-medium opacity-95" onClick={() => {
                context?.setIsCurrentChannelDM(true);
                context?.setCurrentChannel({
                  channel_id: message.sender_id!,
                  channel_name: message.user.display_name || message.user.username,
                  description: message.user.description,
                  created_at: "null"
                })
              }}>{message.user.display_name || message.user.username}</a>
              : <p className="font-bold text-white">{message.user.display_name || message.user.username}</p>
          }
          <p className="text-sm ">{getDate}</p>
        </div>

        {!message.is_image
          ? <MessageMarkdown text={message.content!} />
          : <img className={loadingStyle()} src={message.content!} onLoad={() => setImgLoading(false)} />
        }
      </section>
    </article>
  );
}


function Header() {
  const context = useContext(AppContext);

  return (
    context?.currentChannel && (
      <nav className="z-10 flex items-center h-12 gap-3 shadow-md py-3divide-gray-700 -x ">
        {context.isCurrentChannelDM
          ? <p className="pl-5 text-lg font-semibold">
            {context?.currentChannel?.channel_name}
          </p>
          : <p className="pl-5 text-lg font-semibold">
            #{context?.currentChannel?.channel_name}
          </p>
        }
        <p className="pl-3 text-base ">
          {context?.currentChannel?.description}
        </p>
      </nav>
    )
  );
}


const MessageMarkdown = ({ text }: { text: string }) => {
  return <Markdown
    remarkPlugins={[remarkGfm]}
    allowedElements={["p", "a", "em", "strong", "pre"]}
    components={{
      a(props) {
        const { node, children, ...rest } = props
        return <a className="text-blue-600" {...rest}>{children}</a>
      },
      p(props) {
        const { node, children, ...rest } = props
        return <p className="text-[15px] font-chat break-words whitespace-normal" {...rest} >{children}</p>
      }
    }
    }
  >
    {text}
  </Markdown>
}