import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { VideoCameraIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMessengerStore } from "@stores/messengerStore";
import { SubmitHandler, useForm } from "react-hook-form";
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
  const streamable = useMessengerStore.use.streamable();
  const streams = channel?.streams;

  return streamable && streams ? (
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
  const streamable = useMessengerStore.use.streamable();
  const streams = channel?.streams;

  const { register, handleSubmit, setFocus, setValue } = useForm<ChatMessageSchema>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit: ChatMessageHandlerType = async ({ message }: ChatMessageFieldTypes) => {
    if (!channel) return;
    channel.message(message);
    setValue('message', '');
    setFocus('message');
  }

  return (
    <div className="flex flex-col gap-3 grow h-1/2 mt-2">
      <div className="overflow-y-auto pr-1 grow">
        {messages.map((messageData, index) => {
          const { event: { type }, message } = messageData;
          if (!message || !channel) return (<></>);
          const ours = type === channel.eventTypes.MESSAGE_CONFIRM;
          return (
            <div
              key={index}
              className={clsxm(
                "flex flex-col gap-1 p-2 text-sm mb-2 rounded-sm whitespace-pre-wrap break-all",
                ours && " bg-primary-500 text-fg-200 dark:bg-primary-500 dark:text-fg-200",
                !ours && " bg-bg-100/70 text-fg-700 dark:bg-bg-800/70 dark:text-fg-200",
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
          disabled={waiting}
          registration={register('message')}
        />
        {streamable ? (
          <Button
            className="h-full"
            disabled={waiting}
            onClick={streams ? endCall : startCall}
            color={streams ? "danger" : "primary"}
          >
            <VideoCameraIcon className="w-6 h-6" />
          </Button>
        ) : <></>}
        <Button className="h-full" type="submit" disabled={waiting}>
          <PaperAirplaneIcon className="w-6 h-6" />
        </Button>
      </form>
    </div>
  )
}
