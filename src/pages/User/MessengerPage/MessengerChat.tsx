import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { VideoCameraIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { messengerStoreActions, useMessengerStore } from "@stores/messengerStore";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button, Card, Input, clsxm } from "sparks-ui";
import { z } from "zod";

export const MessengerChat = () => {
  const channel = useMessengerStore.use.channel();
  if (!channel) return <></>
  return (
    <>
      <Card className="p-2 h-full">
        <div className="h-full flex flex-col">
          <ChannelChatVideo />
          <ChannelChatMessages />
        </div>
      </Card>
    </>
  )
};

export const ChannelChatVideo = () => {
  const channel = useMessengerStore.use.channel();
  const call = useMessengerStore.use.call();
  const streams = channel?.state?.streams;
  const streamable = channel?.state.streamable;

  return streamable && streams && call ? (
    <div
      className={clsxm(
        "bg-bg-100/70 dark:bg-bg-800/70 rounded-sm mb-2 p-1 h-auto relative overflow-hidden flex items-center justify-center",
      )}
    >
      <video
        className="h-auto max-h-full object-contain"
        autoPlay
        ref={(ref) => {
          if (ref) ref.srcObject = streams.remote;
        }}
      />
      <video
        autoPlay
        muted
        className="h-1/5 object-contain absolute mx-auto bottom-[1%] mb-1 translate-x-[193%]"
        ref={(ref) => {
          if (ref) ref.srcObject = streams.local;
        }}
      />
    </div>
  ) : <></>
}

const formSchema = z.object({ message: z.string().min(1, { message: 'empty message' }), });
type ChatMessageSchema = z.infer<typeof formSchema>;
type ChatMessageHandlerType = SubmitHandler<ChatMessageSchema>;
type ChatMessageFieldTypes = { message: string };

export const ChannelChatMessages = () => {
  const channel = useMessengerStore.use.channel();
  const waiting = useMessengerStore.use.waiting();
  const messages = useMessengerStore.use.messages();
  const streams = channel?.state.streams;
  const streamable = channel?.state.streamable;
  const call = channel?.state.call;

  const { register, handleSubmit, setFocus, setValue } = useForm<ChatMessageSchema>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit: ChatMessageHandlerType = async ({ message }: ChatMessageFieldTypes) => {
    if (!channel) return;
    messengerStoreActions.setWaiting(true);
    channel.message(message);
    setValue('message', '');
  }

  useEffect(() => {
    setFocus('message');
  })

  const startCall = async () => {
    if (!channel) return;
    messengerStoreActions.setWaiting(true);
    await channel.call({ timeout: 25000 })
      .catch(() => {
        toast.error('call timed out, try again')
        messengerStoreActions.setWaiting(false);
      });
  }

  const endCall = async () => {
    if (!channel) return;
    messengerStoreActions.setWaiting(true);
    await channel.hangup();
  }

  return (
    <div className="flex flex-col gap-3 grow h-1/2 mt-2">
      <div className="overflow-y-auto pr-1 grow">
        {messages.map((event, index) => {
          const { data, request, response } = event;
          const message = data;
          return (
            <div
              key={index}
              className={clsxm(
                "flex flex-col gap-1 p-2 text-sm mb-2 rounded-sm whitespace-pre-wrap break-all",
                request && " bg-primary-500 text-fg-200 dark:bg-primary-500 dark:text-fg-200",
                response && " bg-bg-100/70 text-fg-700 dark:bg-bg-800/70 dark:text-fg-200",
              )}
            >
              {message as unknown as string}
            </div>
          )
        })}
      </div>
      <form className="flex gap-x-2 justify-center items-stretch flex-none" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="message"
          type="text"
          autoFocus
          autoComplete="off"
          disabled={waiting || !channel?.state.open}
          registration={register('message')}
        />
        {streamable ? (
          <Button
            className="h-full"
            disabled={waiting || !channel?.state.open}
            onClick={streams && call ? endCall : startCall}
            color={streams && call ? "danger" : "primary"}
          >
            <VideoCameraIcon className="w-6 h-6" />
          </Button>
        ) : <></>}
        <Button className="h-full" type="submit" disabled={waiting || !channel?.state.open}>
          <PaperAirplaneIcon className="w-6 h-6" />
        </Button>
      </form>
    </div>
  )
}
