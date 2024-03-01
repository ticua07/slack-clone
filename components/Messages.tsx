"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "@/app/page";
import { AppContextType, CombinedMessage } from "@/types/types";
import MessageInput from "./MessageInput";
import { createClient } from "@/utils/supabase/client";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { Edit, Trash2 } from "lucide-react";
import Spinner from "./Spinner";


const DEFAULT_USER_IMAGE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=ys"

export default function Messages() {
  const supabase = createClient();
  const context = useContext(AppContext);
  const message_list = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<CombinedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!context?.currentChannel) {
      setLoading(false);
      return;
    }

    let res = await fetch(
      `/api/messages?channel_id=${context?.currentChannel?.channel_id}`
    );

    const json = await res.json();
    setMessages(json);
    setLoading(false)
  };

  const fetchDMs = async () => {
    if (!context?.currentChannel) {
      setLoading(false);
      return;
    }

    let res = await fetch(`/api/dms?me=${context?.user!.id}&other=${context?.currentChannel?.channel_id}`)
    let messages: CombinedMessage[] = await res.json()
    setMessages(messages);
    setLoading(false)
  };

  useEffect(() => {
    setMessages([]);
    setLoading(true)

    if (!context?.currentChannel) {
      setLoading(false)
      return;
    }

    const getMessages = async () => {
      // Fetch DMs or messages based on if we're on a public channel or private conversation
      if (!context?.currentChannel) {
        setLoading(false)
      }

      // After that, listen for changes
      context?.isCurrentChannelDM ? await fetchDMs() : await fetchMessages();
      supabase
        .channel(context?.isCurrentChannelDM ? "direct_messages" : "messages")
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


  const addMessageClientSide = (message: CombinedMessage) => {
    setMessages(msgs => [...msgs, message])
  }

  return (
    <section className="flex flex-col w-full h-screen">
      <Header />
      <section className="flex flex-col h-full pb-2 pl-2 mt-auto overflow-y-scroll" ref={message_list}>
        {loading == true ? (
          <section className="flex items-center justify-center w-full h-full">
            <Spinner />
          </section>
        )
          : messages.map((val) => <Message key={val.id} message={val} context={context} />)
        }
      </section>
      <MessageInput isDm={context?.isCurrentChannelDM!} addMessageClientSide={addMessageClientSide} />
    </section>
  );
}

export function Message({ message, context }: { message: CombinedMessage, context: AppContextType | null }) {
  const [imgLoading, setImgLoading] = useState(true);
  const [pfpLoading, setPfpLoading] = useState(true);

  const [holdingShift, setHoldingShift] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setHoldingShift(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        console.log("bye")
        setHoldingShift(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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

  const loadingStyle = (val: boolean) => {
    if (val) return "opacity-0"
    return "opacity-100 aspect-auto"
  }


  const goToDm = () => {
    if (message.sender_id === context!.user!.id) return;

    context?.setIsCurrentChannelDM(true);
    context?.setCurrentChannel({
      channel_id: message.sender_id!,
      channel_name: message.user.display_name || message.user.username,
      description: message.user.description,
      created_at: "null"
    })
  }

  return (
    <article className="relative flex gap-2 p-1 group">

      {holdingShift
        ?
        <div className="absolute -translate-x-1/2 invisible left-[90%] group-hover:visible
          rounded w-24 h-7 bg-zinc-200 shadow-md flex flex-row justify-around"
        >

          <button className="flex items-center justify-center flex-1 h-full rounded outline-none active:scale-90 hover:bg-zinc-300">
            <Edit color="#333" />
          </button>
          <button className="flex items-center justify-center flex-1 h-full rounded outline-none active:scale-90 hover:bg-zinc-300">
            <Trash2 color="#f70000" fill="transparent" />
          </button>
        </div>

        : <></>
      }


      <img
        className={`${pfpLoading ? "opacity-0" : "opacity-100"} mt-1 max-w-10 max-h-10 rounded-[50%]`}
        onLoad={() => setPfpLoading(false)}
        src={message.user.pfp.length > 0 ? message.user.pfp : DEFAULT_USER_IMAGE}
        alt="profile"
      />
      <section>
        <div className="flex flex-row items-baseline gap-2 ">
          {
            message.sender_id !== null
              ? <a className="font-bold opacity-95" onClick={goToDm}>{message.user.display_name || message.user.username}</a>
              : <p className="font-bold">{message.user.display_name || message.user.username}</p>
          }
          <p className="text-sm">{getDate}</p>
        </div>

        {!message.is_image
          ? <MessageMarkdown text={message.content!} />
          : <a href={message.content!} target="_blank">
            <img
              className={`${imgLoading ? "opacity-0" : "opacity-100"} aspect-autotransition-opacity duration-200 object-contain max-h-64`}
              src={message.content!}
              onLoad={() => setImgLoading(false)}
            />
          </a>
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
    unwrapDisallowed={true}
    components={{
      a(props) {
        const { node, children, ...rest } = props
        return <a className="text-[15px] text-blue-600" {...rest}>{children}</a>
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