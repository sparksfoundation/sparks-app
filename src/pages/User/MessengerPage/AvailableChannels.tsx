import { ArrowPathIcon, LinkIcon, PaperAirplaneIcon, TrashIcon } from "@heroicons/react/20/solid";
import { channelActions, useChannelStore } from "@stores/refactor/channelStore";
import { chatStoreActions, useChatStore } from "@stores/refactor/chatStore";
import { ChannelState, ChannelType, WebRTC } from "sparks-sdk/channels";
import { Card, P } from "sparks-ui";

export const AvailableChannels = () => {
  const channel = useChatStore.use.channel();
  const channels = Object.values(useChannelStore.use.channels())
    .filter((channel) => channel.type === ChannelType.WEBRTC_CHANNEL) as WebRTC[];

  async function openChat(channel: WebRTC) {
    await chatStoreActions.startChat(channel);
  }

  async function reconnect(channel: WebRTC) {
    await channel.open();
    await chatStoreActions.startChat(channel);
  }

  function deleteChannel(channel: WebRTC) {
    if (confirm('Are you sure you want to delete this channel?') === false) return;
    chatStoreActions.closeChat(channel);
    channelActions.remove(channel)
  }

  if (channel) return <></>

  return (
    <>
      {Object.values(channels).map(channel =>
        <Card key={channel.cid} className="w-full p-4 mb-2 h-auto">
          <div className="flex gap-4 items-stretch">
            <P className="overflow-hidden nowrap text-ellipsis grow">{channel.peerAddress}</P>
            {channel.status === ChannelState.OPENED ? (
              <button onClick={() => openChat(channel)}>
                <PaperAirplaneIcon className="w-6 h-6 fill-primary-600 shrink-0" />
              </button>
            ) : channel.status === ChannelState.PENDING ? (
              <ArrowPathIcon className="w-6 h-6 fill-primary-600 shrink-0 animate-spin" />
            ) : (
              <button onClick={() => reconnect(channel)}>
                <LinkIcon className="w-6 h-6 fill-primary-600 shrink-0" />
              </button>
            )}
            <button onClick={() => deleteChannel(channel)}>
              <TrashIcon className="w-6 h-6 fill-warning-600 shrink-0" />
            </button>
          </div>
        </Card>
      )}
    </>
  )
}