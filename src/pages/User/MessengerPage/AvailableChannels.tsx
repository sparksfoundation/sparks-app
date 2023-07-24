import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { useChannelStore } from "@stores/channels";
import { messengerStoreActions, useMessengerStore } from "@stores/messengerStore";
import { WebRTC } from "sparks-sdk/channels/WebRTC";
import { Card, P } from "sparks-ui";

export const AvailableChannels = () => {
  const channel = useMessengerStore.use.channel();
  const channels = useChannelStore.use.channels();
  const webRtcChannels = Object.values(channels).filter(channel => channel instanceof WebRTC) as WebRTC[];

  async function openChat(channel: WebRTC) {
    await messengerStoreActions.setChannel(channel);
  }

  if (channel) return <></>

  return (
    <>
      {webRtcChannels.map(channel =>
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