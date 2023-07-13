import { Button, Card, H5, P } from "sparks-ui"
import { useState } from "react"
import { PostMessage } from "sparks-sdk/channels/ChannelTransports"
import { userStore } from "@stores/userStore";
import { ChannelEvent } from "sparks-sdk/channels/ChannelEvent";
import { toast } from "react-toastify";
import { channelStoreActions } from "@stores/channels";
import { useChannelStore } from "@stores/channels";

export const SparksFoundation = ({ connectionWaiting = false }) => {
  const user = userStore(state => state.user);
  const [connection, setConnection] = useState<PostMessage | null>(null)
  const [verified, setVerified] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [request, setRequest] = useState(connectionWaiting)
  const channels = useChannelStore.use.channels();

  async function connect({ url, source: _source }: { url: string, source?: Window }) {
    if (!user) return

    const source = request && window.opener ? window.opener : _source || window.open(url, '_blank');
    if (!source) return;

    const origin = new URL(url).origin;

    const existingChannel = Object.values(channels).find(channel => channel.peer.origin === origin);
    const channel = (existingChannel || new PostMessage({ peer: { origin }, spark: user, })) as PostMessage
    if (source) channel.setSource(source)

    channel.on(channel.errorTypes.REQUEST_TIMEOUT_ERROR, (error) => {  
      if (error.metadata?.eventType !== 'CLOSE_REQUEST') {
        setConnection(null)
        setVerified(false)
      }

      if (error.metadata?.eventType !== 'OPEN_REQUEST') return
      
      if (!_source) {
        channel.removeAllListeners();
        return connect({ url, source })
      }

      channel.removeAllListeners();

      toast.error('Connection timeout, try again.')

      setTimeout(() => {
        setWaiting(false);
        setConnection(null);
        setVerified(false);
      }, 250);
    })

    channel.on(channel.eventTypes.OPEN_CONFIRM, () => {
      channelStoreActions.add(channel);
    });

    await channel.open()

    setWaiting(false)
    setConnection(channel)

    const receiptEvent = await channel.message({ handle: user.agents.profile.handle });
    try {
      await channel.openEvent(receiptEvent as ChannelEvent<any>)
      setVerified(!!receiptEvent.data && !!receiptEvent.seal)
    } catch (e) {
      setVerified(false)
    }

    channel.on([
      channel.eventTypes.ANY_ERROR,
      channel.eventTypes.CLOSE_REQUEST,
      channel.eventTypes.CLOSE_CONFIRM,
    ], (event) => {
      if (event.type === 'REQUEST_TIMEOUT_ERROR') return;
      channel.removeAllListeners()
      setWaiting(false)
      setConnection(null)
      setVerified(false)
    })
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