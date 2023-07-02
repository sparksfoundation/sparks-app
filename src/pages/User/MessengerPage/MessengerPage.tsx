import { ArrowPathIcon, LinkIcon, PaperAirplaneIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { PrivateLayoutHeader } from "@layout";
import { useModal } from "@stores/modal";
import { Card, P } from "sparks-ui";
import { StartChatDialog } from "./StartChatDialog";
import { useLocation, useNavigate } from "react-router-dom";
import { Paths } from "@routes/paths";
import { MessengerChat } from "./MessengerChat";
import { useChannels } from "@stores/channels";
import { ChannelId, ChannelState, WebRTC } from "sparks-sdk/channels";
import { useEffect, useState } from "react";
import { useUser } from "@stores/user";

const ChannelsList = ({ channels }: { channels: { [key: ChannelId]: WebRTC } }) => {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const { removeChannel } = useChannels(state => ({ removeChannel: state.removeChannel }));

  function openChat(channel: WebRTC) {
    navigate(Paths.USER_MESSENGER, { state: { channelId: channel.cid } });
  }

  async function reconnect(channel: WebRTC) {
    setConnecting(true);
    await channel.open();
    setConnecting(false);
    navigate(Paths.USER_MESSENGER, { state: { channelId: channel.cid }, replace: true })
  }

  function deleteChannel(channel: WebRTC) {
    if (confirm('Are you sure you want to delete this channel?') === false) return;
    removeChannel(channel)
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
  const { channels, addChannel, saveChannelData } = useChannels(state => ({ channels: state.channels, addChannel: state.addChannel, saveChannelData: state.saveChannelData }));
  const navigate = useNavigate();
  const { openModal } = useModal(state => ({ openModal: state.openModal }));
  const [activeChannel, setActiveChannel] = useState<WebRTC | null>(null);
  const { user } = useUser(state => ({ user: state.user }));
  const location = useLocation();

  async function handleConnected(channel: WebRTC) {
    await addChannel(channel);
    await saveChannelData(channel);
    navigate(Paths.USER_MESSENGER, { state: { channelId: channel.cid }, replace: true })
  }

  function onChatClosed() {
    setActiveChannel(null);
  }

  useEffect(() => {
    if (activeChannel) {
      activeChannel.onclose = () => {
        setActiveChannel(null);
      }
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
      {activeChannel ? (
        <MessengerChat channel={activeChannel} handleCloseChat={onChatClosed} user={user} />
      ) : (
        <>
          <ChannelsList channels={channels as { [key: ChannelId]: WebRTC }} />
          <button onClick={newChat} className="bg-primary-600 rounded-full overflow-hidden fixed bottom-4 right-4">
            <span className="bg-bg-200 h-1/2 w-1/2 absolute top-1/4 left-1/4"></span>
            <PlusCircleIcon
              height={36}
              width={36}
              className="bottom-0 right-0 fill-primary-600 cursor-pointer relative"
            />
          </button>
        </>
      )}
    </>
  )
}
