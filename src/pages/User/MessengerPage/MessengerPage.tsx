import { ArrowPathIcon, LinkIcon, PaperAirplaneIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { PrivateLayoutHeader } from "@layout";
import { Card, P } from "sparks-ui";
import { StartChatDialog } from "./StartChatDialog";
import { useLocation, useNavigate } from "react-router-dom";
import { Paths } from "@routes/paths";
import { MessengerChat } from "./MessengerChat";
import { ChannelEventType, ChannelState, ChannelType, WebRTC } from "sparks-sdk/channels";
import { useEffect, useState } from "react";
import { User, userStore } from "@stores/refactor/userStore";
import { modalActions } from "@stores/refactor/modalStore";
import { channelActions, channelStore } from "@stores/refactor/channelStore";

const ChannelsList = () => {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const channels = Object.values(channelStore(state => state.channels))
    .filter((channel) => channel.type === ChannelType.WEBRTC_CHANNEL) as WebRTC[];

  function openChat(channel: WebRTC) {
    navigate(Paths.USER_MESSENGER, { state: { channelId: channel.cid } });
  }

  async function reconnect(channel: WebRTC) {
    setConnecting(true);
    await channel.open();
    await channelActions.add(channel);
    setConnecting(false);
    navigate(Paths.USER_MESSENGER, { state: { channelId: channel.cid }, replace: true })
  }

  function deleteChannel(channel: WebRTC) {
    if (confirm('Are you sure you want to delete this channel?') === false) return;
    channelActions.remove(channel)
  }

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
            ) : connecting ? (
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

export const MessengerPage = () => {
  const channels = channelStore(state => state.channels);
  const navigate = useNavigate();
  const { openModal } = modalActions;
  const [activeChannel, setActiveChannel] = useState<WebRTC | null>(null);
  const user = userStore(state => state.user) as User;
  const location = useLocation();

  async function handleConnected(channel: WebRTC) {
    await channelActions.add(channel);
    navigate(Paths.USER_MESSENGER, { state: { channelId: channel.cid }, replace: true })
  }

  async function onChatClosed() {
    setActiveChannel(null);
  }

  useEffect(() => {
    if (activeChannel) {
      activeChannel.on([
        ChannelEventType.CLOSE,
        ChannelEventType.CLOSE_CONFIRMATION,
      ], () => {
        setActiveChannel(null);
      }, { once: true });
    } else {
      if (!location.state?.channelId) return;
      const channel = channels[location.state.channelId];
      if (!channel) return;
      location.state.channelId = undefined;
      setActiveChannel(channel as WebRTC);
    }
  }, [activeChannel, channels, location])

  async function newChat() {
    openModal({
      title: 'Start Chat',
      content: <StartChatDialog onConnected={handleConnected} />
    });
  }

  return (
    <>
      <PrivateLayoutHeader title="Messenger" />
      <div className="relative h-full flex flex-col max-w-4xl mx-auto w-full">
        {activeChannel ? (
            <MessengerChat channel={activeChannel} handleCloseChat={onChatClosed} user={user} />
        ) : (
          <>
            <ChannelsList />
            <button onClick={newChat} className="bg-primary-600 rounded-full overflow-hidden fixed bottom-4 right-4">
              <span className="bg-bg-200 h-1/2 w-1/2 absolute top-1/4 left-1/4"></span>
              <PlusCircleIcon
                height={48}
                width={48}
                className="bottom-0 right-0 fill-primary-600 cursor-pointer relative"
              />
            </button>
          </>
        )}
      </div>
    </>
  )
}
