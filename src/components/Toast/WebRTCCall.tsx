import { toast } from "react-toastify";
import { Button, P } from "sparks-ui";

export const WebRTCCall = ({ identifier, resolve, reject }: { identifier: any, resolve: Function, reject: Function }) => {
  if (!identifier) return null;
  const peerId = `${identifier.slice(0, 6)}...${identifier.slice(-6)}`;

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
  identifier,
  resolve,
  reject,
}: { identifier: any, resolve: ()=>void, reject?: ()=>void }) => {
  toast(({ closeToast }) =>
    <WebRTCCall
      identifier={identifier}
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
