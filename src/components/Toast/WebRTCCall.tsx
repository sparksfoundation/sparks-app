import { ReactNode } from "react";
import { ToastContentProps } from "react-toastify";
import { Button, P } from "sparks-ui";

export const WebRTCCall = ({ peerIdentifier, accept, reject, closeToast }: { peerIdentifier: any, accept: Function, reject: Function, closeToast: (() => void) | undefined }) => {
  const peerId = `${peerIdentifier.slice(0, 6)}...${peerIdentifier.slice(-6)}`;

  async function handleAccept() {
    await accept();
    if (closeToast) closeToast();
  }

  return (
    <>
      <P className="text-sm font-semibold">SPARK: {peerId}</P>
      <P className="mb-2">wants to start a video call</P>
      <div className="flex flex-row justify-between gap-2">
        <Button className="grow" color="warning" onClick={() => reject()}>Reject</Button>
        <Button className="grow" color="success" onClick={handleAccept}>Accept</Button>
      </div>
    </>
  )
}

export type InviteToaster = ({
  identifier,
  accept,
  reject,
}: {
  identifier: string,
  accept: () => Promise<void>,
  reject: () => Promise<void>,
}) => (props: ToastContentProps<unknown>) => ReactNode;

export const inviteToaster: InviteToaster = ({
  identifier,
  accept,
  reject,
}: { identifier: any, accept: Function, reject: Function }) => {
  return ({ closeToast }) => (
    <WebRTCCall
      peerIdentifier={identifier}
      accept={accept}
      reject={reject}
      closeToast={closeToast}
    />
  )
}
