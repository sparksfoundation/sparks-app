import { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, P } from "sparks-ui";
import { ChannelOpenRequestEvent, PostMessage, WebRTC } from "sparks-sdk/channels";
import { userStore } from "@stores/refactor/userStore";
import { themeStore } from "@stores/refactor/themeStore";
import { channelActions } from "@stores/refactor/channelStore";
import { chatStoreActions } from "@stores/refactor/chatStore";
import { useNavigate } from "react-router-dom";
import { Paths } from "@routes/paths";

export const HandleWebRTCInvite = ({ event, resolve, reject, closeToast }: { event: ChannelOpenRequestEvent, resolve: Function, reject: Function, closeToast: (() => void) | undefined }) => {
  const peerId = `${event.data.identifier.slice(0, 6)}...${event.data.identifier.slice(-6)}`;
  const navigate = useNavigate();
  async function handleAccept() {
    await resolve();
    if (closeToast) closeToast();
    navigate(Paths.USER_MESSENGER)
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

export const HandlePostMessageInvite = (_?: any) => <></>

export const NotificationProvider = () => {
  const user = userStore(state => state.user);
  const { identifier } = user || { identifier: '' };
  const theme = themeStore(state => state.theme);

  useEffect(() => {
    if (!user || !user.identifier) return;

    PostMessage.handleOpenRequests(async ({ event, resolve, reject }) => {
      const addAndResolve = async () => {
        const channel = await resolve() as any;
        await channelActions.add(channel);
      }
      toast(({ closeToast }) => <HandlePostMessageInvite event={event} resolve={addAndResolve} reject={reject} closeToast={closeToast} />);
    }, { spark: user });

    WebRTC.handleOpenRequests(async ({ event, resolve, reject }) => {
      const addAndResolve = async () => {
        const channel = await resolve() as any;
        await chatStoreActions.startChat(channel);
      }
      toast(({ closeToast }) => <HandleWebRTCInvite event={event} reject={reject} resolve={addAndResolve} closeToast={closeToast} />);
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