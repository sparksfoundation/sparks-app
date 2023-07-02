import { PaperAirplaneIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { PrivateLayoutHeader } from "@layout";
import { useModal } from "@stores/modal";
import { useUser } from "@stores/user";
import { Card, P } from "sparks-ui";
import { StartChatDialog } from "./StartChatDialog";
import { ChannelType, WebRTC } from "sparks-sdk/channels";
import { useLocation, useNavigate } from "react-router-dom";
import { Paths } from "@routes/paths";
import { MessengerChat } from "./MessengerChat";

const ChannelsList = ({ channels }: { channels: WebRTC[] }) => {
  const navigate = useNavigate();

  function openChat(channel: WebRTC) {
    navigate(Paths.USER_MESSENGER, { state: { channelId: channel.cid } });
  }

  return (
    <>
      {channels.map(channel => {
        return (
          <Card key={channel.cid} className="w-full p-4 mb-2 h-auto">
            <div className="flex gap-4">
              <P className="overflow-hidden nowrap text-ellipsis shrink">{channel.peer.identifier}</P>
              <PaperAirplaneIcon className="w-6 h-6 fill-primary-600 shrink-0" onClick={() => openChat(channel)} />
            </div>
          </Card>
        )
      })}
    </>
  )
}

export const MessengerPage = () => {
  const { user } = useUser(state => ({ user: state.user }));
  const channels = user.getChannelsByType(ChannelType.WEBRTC_CHANNEL) as WebRTC[];
  const location = useLocation();
  const navigate = useNavigate();
  const activeChannel = channels.find(channel => channel.cid === location.state?.channelId);
  const { openModal } = useModal(state => ({ openModal: state.openModal }));

  console.log(user.agents.profile.name);

  function handleConnected(channel: WebRTC) {
    navigate(Paths.USER_MESSENGER, { state: { channelId: channel.cid } })
  }

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
        <MessengerChat channel={activeChannel} />
      ) : (
        <>
          <ChannelsList channels={channels} />
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
