import { toast } from "react-toastify";
import { ChannelRequestEvent } from "sparks-sdk/channels/ChannelEvent";
import { Button, P } from "sparks-ui";

export const WebRTCCall = ({ event, resolve, reject }: { event: any, resolve: Function, reject: Function }) => {
  if (!event?.data?.identifier) return null;
  const peerId = `${event.data.identifier.slice(0, 6)}...${event.data.identifier.slice(-6)}`;

  return (
    <>
      <P className="text-sm font-semibold">SPARK: {peerId}</P>
      <P className="mb-2">wants to start a video call</P>
      <div className="flex flex-row justify-between gap-2">
        <Button className="grow" color="warning" onClick={() => reject()}>Reject</Button>
        <Button className="grow" color="success" onClick={() => resolve()}>Accept</Button>
      </div>
    </>
  )
}

export const webRTCCallToaster = ({
  event,
  resolve,
  reject,
}: { event: ChannelRequestEvent, resolve: ()=>void, reject?: ()=>void }) => {
  toast(({ closeToast }) =>
    <WebRTCCall
      event={event as ChannelRequestEvent}
      resolve={() => {
        resolve();
        if (closeToast) closeToast();
      }}
      reject={() => {
        if (reject) reject();
        if (closeToast) closeToast();
      }}
    />
  );
}
