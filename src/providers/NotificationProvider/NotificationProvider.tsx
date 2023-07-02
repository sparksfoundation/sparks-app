import { useUser } from "@stores/user";
import { useEffect } from "react";
import { PostMessage, WebRTC } from "sparks-sdk/channels";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from "@stores/theme";
import { Button, P } from "sparks-ui";
import { useNavigate } from "react-router-dom";
import { Paths } from "@routes/paths";

const HandleChatInvite = ({ event, resolve, reject, closeToast }: { event: any, resolve: Function, reject: Function, closeToast: (() => void) | undefined }) => {
  const peerId = `${event.data.identifier.slice(0, 6)}...${event.data.identifier.slice(-6)}`;
  const navigate = useNavigate();

  async function handleAccept() {
    await resolve();
    if (closeToast) closeToast();
    navigate(Paths.USER_MESSENGER, { state: { channelId: event.metadata.cid } });
  }

  return (
    <>
      <P className="text-sm font-semibold">SPARK: {peerId}</P>
      <P className="mb-2">wants to start a chat</P>
      <div className="flex flex-row justify-between gap-2">
        <Button className="grow" color="warning" onClick={() => reject()}>Reject</Button>
        <Button className="grow" color="success" onClick={handleAccept}>Accept</Button>
      </div>
    </>
  )
}

export const NotificationProvider = () => {
  const { user } = useUser(state => ({ user: state.user }));
  const { identifier } = user || { identifier: '' };
  const { theme } = useTheme(state => ({ theme: state.theme }));

  useEffect(() => {
    if (!user || !user.identifier) return;

    PostMessage.handleOpenRequests(async (props) => {
      toast(({ closeToast }) => <HandleChatInvite {...props} closeToast={closeToast} />);
    }, { spark: user });

    WebRTC.handleOpenRequests(async (props) => {
      console.log(props);
      toast(({ closeToast }) => <HandleChatInvite {...props} closeToast={closeToast} />);
    }, { spark: user });

  }, [identifier])

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={50000000}
      hideProgressBar={false}
      closeOnClick={true}
      pauseOnHover={true}
      draggable={true}
      theme={theme}
    />
  )
}