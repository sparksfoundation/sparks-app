import { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, P } from "sparks-ui";
import { userStore } from "@stores/refactor/userStore";
import { themeStore } from "@stores/refactor/themeStore";
import { channelActions } from "@stores/channelStore";
import { chatStoreActions } from "@stores/refactor/chatStore";
import { useNavigate } from "react-router-dom";
import { Paths } from "@routes/paths";
import { ChannelRequestEvent } from "sparks-sdk/channels/ChannelEvent";
import { PostMessage, WebRTC } from "sparks-sdk/channels/ChannelTransports";

export const HandleWebRTCInvite = ({ event, resolve, closeToast }: { event: ChannelRequestEvent<false>, resolve: Function, closeToast: () => void }) => {
  const peerId = `${event.data.peer.identifier.slice(0, 6)}...${event.data.peer.identifier.slice(-6)}`;
  const navigate = useNavigate();
  async function handleAccept() {
    console.log('resolving');
    await resolve();
    console.log('resolved');
    if (closeToast) closeToast();
    console.log('navigating to ', Paths.USER_MESSENGER);
    navigate(Paths.USER_MESSENGER)
  }

  return (
    <>
      <P className="text-sm font-semibold">SPARK: {peerId}</P>
      <P className="mb-2">wants to start a chat</P>
      <div className="flex flex-row justify-between gap-2">
        <Button className="grow" color="warning" onClick={() => closeToast()}>Reject</Button>
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

    PostMessage.receive(async ({ event, confirmOpen }) => {
      const addAndResolve = async () => {
        console.log('accepting')
        const channel = await confirmOpen() as any;
        console.log('channel acquired');
        await channelActions.add(channel);
        console.log('added to chat store')
      }
      toast(({ closeToast }) => <HandlePostMessageInvite event={event} resolve={addAndResolve} closeToast={closeToast} />);
    }, { spark: user });

    WebRTC.receive(async ({ event, confirmOpen }) => {
      const addAndResolve = async () => {
        const channel = await confirmOpen() as any;
        await chatStoreActions.startChat(channel);
      }
      toast(({ closeToast }) => <HandleWebRTCInvite event={event as ChannelRequestEvent<false>} resolve={addAndResolve} closeToast={closeToast as () => void} />);
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