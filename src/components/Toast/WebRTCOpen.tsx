import { Paths } from "@routes/paths";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChannelRequestEvent } from "sparks-sdk/channels/ChannelEvent";
import { Button, P } from "sparks-ui";

export const WebRTCOpen = ({ event, resolve, reject }: { event: ChannelRequestEvent, resolve: Function, reject: () => void }) => {
  const peerId = `${event.data.peer.identifier.slice(0, 6)}...${event.data.peer.identifier.slice(-6)}`;
  const navigate = useNavigate();
  async function handleAccept() {
    await resolve();
    navigate(Paths.USER_MESSENGER)
  }

  return (
    <>
      <P className="text-sm font-semibold">SPARK: {peerId}</P>
      <P className="mb-2">wants to start a chat</P>
      <div className="flex flex-row justify-between gap-2">
        <Button className="grow" color="warning" onClick={reject}>Reject</Button>
        <Button className="grow" color="success" onClick={handleAccept}>Accept</Button>
      </div>
    </>
  )
}

export const webRTCOpenToaster = ({
  event,
  resolve,
  reject,
}: { event: ChannelRequestEvent, resolve: ()=>void, reject?: ()=>void }) => {
  toast(({ closeToast }) =>
    <WebRTCOpen
      event={event as ChannelRequestEvent}
      resolve={resolve}
      reject={() => {
        if (reject) reject();
        if (closeToast) closeToast();
      }}
    />
  );
}
