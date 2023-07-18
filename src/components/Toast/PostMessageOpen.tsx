import { toast } from "react-toastify";
import { ChannelRequestEvent } from "sparks-sdk/channels/ChannelEvent";
import { Button, P } from "sparks-ui";

export const PostMessageOpen = ({ event, resolve, reject }: { event: ChannelRequestEvent, resolve: () => void, reject: () => void }) => {
  const peerOrigin = event.data.origin;
  return (
    <>
      <P className="text-sm font-semibold">SPARK: {peerOrigin}</P>
      <P className="mb-2">wants to connect</P>
      <div className="flex flex-row justify-between gap-2">
        <Button className="grow" color="warning" onClick={reject}>Reject</Button>
        <Button className="grow" color="success" onClick={resolve}>Accept</Button>
      </div>
    </>
  )
}

export const postMessageOpenToaster = ({
  event,
  resolve,
  reject,
}: { event: ChannelRequestEvent, resolve: ()=>void, reject?: ()=>void }) => {
  return toast(({ closeToast }) =>
    <PostMessageOpen
      event={event as ChannelRequestEvent}
      resolve={() => {
        if (resolve) resolve();
        if (closeToast) closeToast();
      }}
      reject={() => {
        if (reject) reject();
        if (closeToast) closeToast();
      }}
    />, {
    autoClose: event.data.timeout,
  });
}
