import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { useChannelStore } from "@stores/channelStore";
import { chatStoreActions, useChatStore } from "@stores/chatStore";
import { WebRTC } from "sparks-sdk/channels/ChannelTransports";
import { Card, P } from "sparks-ui";

export const AvailableChannels = () => {
  const channel = useChatStore.use.channel();
  const channels = Object.values(useChannelStore.use.channels()) as WebRTC[];
    // .filter((channel) => channel.type === ChannelType.WEBRTC_CHANNEL) as WebRTC[];

  async function openChat(channel: WebRTC) {
    await chatStoreActions.setChannel(channel);
  }

  if (channel) return <></>

  return (
    <>
      {Object.values(channels).map(channel =>
        <Card key={channel.channelId} className="w-full p-4 mb-2 h-auto">
          <div className="flex gap-4 items-stretch">
            <P className="overflow-hidden nowrap text-ellipsis grow">{channel.peer.identifier}</P>
            <button onClick={() => openChat(channel)}>
              <ArrowRightOnRectangleIcon className="w-6 h-6 fill-primary-600 shrink-0" />
            </button>
          </div>
        </Card>
      )}
    </>
  )
}