import { Button, Card, H5, P } from "sparks-ui"
import { useState } from "react"
import { PostMessage } from "sparks-sdk/channels/ChannelTransports"
import { userStore } from "@stores/userStore";
import { toast } from "react-toastify";

export const SparksFoundation = ({ connectionWaiting = false }) => {
  const user = userStore(state => state.user);
  const [connection, setConnection] = useState<PostMessage | null>(null)
  const [verified, setVerified] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [request, setRequest] = useState(connectionWaiting)

  async function connect({ url, source: _source }: { url: string, source?: Window }) {
    if (!user) return

    const source = request && window.opener ? window.opener : _source || window.open(url, '_blank');
    if (!source) return;

    const origin = new URL(url).origin;
    const channel = new PostMessage({ peer: { origin }, spark: user, settings: { timeout: 2000 }});

    if (source) channel.state.source = source;

    setWaiting(true);
    setConnection(null);
    setVerified(false);

    channel.on(channel.confirmTypes.OPEN_CONFIRM, async () => {
      setVerified(true)
      setWaiting(false)
      setConnection(channel)
    });

    channel.on([
      channel.errorTypes.CONFIRM_TIMEOUT_ERROR,
    ], (event) => {
      const isOpen = channel.state.open;
      const isRequest = event.metadata?.eventType === 'OPEN_REQUEST';
      if (isOpen || !isRequest) return;
      channel.removeAllListeners();
      setWaiting(false);
      setConnection(null);
      toast.error('Connection timeout, try again.');
    });

    channel.on([
      channel.eventTypes.CLOSE_REQUEST,
      channel.eventTypes.CLOSE_CONFIRM,
    ], () => {
      channel.removeAllListeners()
      setVerified(false)
      setWaiting(false)
      setConnection(null)
    })

    await new Promise(resolve => setTimeout(resolve, 2000));
    await channel.open()
    await channel.message({ handle: user.agents.profile.handle });
  }

  async function disconnect() {
    setWaiting(true)
    if (!connection) return
    await connection.close()
    setConnection(null)
    setVerified(false)
    setWaiting(false)
  }

  async function launch() {
    setWaiting(true)
    setRequest(false)
    const url = import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://sparks.foundation'
    connect({ url })
  }

  let action = 'launch'
  if (request) action = 'approve'
  if (waiting) action = connection ? 'disconnecting' : 'connecting'
  if (connection) action = waiting ? action : 'disconnect'

  let status = 'not connected'
  if (request) status = 'approve connection'
  if (waiting) status = connection ? 'disconnecting' : 'connecting'
  if (connection) status = 'connected'
  if (verified) status = 'connection verified'

  return (
    <Card className="p-0 max-w-sm" shade='light'>
      <img src="/images/sparksfoundation.png" />
      <div className="p-4">
        <H5 className="text-center mb-2">SPARKS Foundation</H5>
        <P className="text-sm text-justify mb-4">Provides an example of personalized content experience based on your information, no login or server side data required.</P>
        <P className="font-bold mb-2 text-sm text-center">{status}</P>
        <Button
          onClick={connection ? disconnect : launch}
          className='flex justify-center items-center'
          color={connection ? 'warning' : request ? 'success' : 'primary'}
          fullWidth
          disabled={waiting}
        >
          {action}
        </Button>
      </div>
    </Card>
  )
}