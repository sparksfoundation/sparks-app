import { Button, Card, H5, P } from "sparks-ui"
import { useUser } from "@stores/user"
import { useState } from "react"
import { PostMessage } from "sparks-sdk/channels/PostMessage"

export const SparksFoundation = ({ connectionWaiting = false }) => {
  const { user } = useUser(state => ({ user: state.user }))
  const [connection, setConnection] = useState<PostMessage | null>(null)
  const [verified, setVerified] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [request, setRequest] = useState(connectionWaiting)

  async function connect({ url }: { url: string }) {
    if (!user) return
    const source = request && window.opener ? window.opener : window.open(url, '_blank');
    if (!source) return;
    const origin = new URL(url).origin;

    const channel = new PostMessage({
      source: source as Window,
      origin,
      spark: user,
    }) as PostMessage

    setTimeout(async () => {
      channel.onerror = ({ error }) => {
        console.log('error', error)
      }
      await channel.open().catch(e => console.log(e))
      setWaiting(false)
      setConnection(channel)

      const receiptEvent = await channel.message({ name: user.agents.profile.name });
      try {
        const opened = await user.open({ signature: receiptEvent.data.receipt, publicKey: channel.peer.publicKeys.signer }) as string;
        const decrypted = await user.decrypt({ data: opened, sharedKey: channel.sharedKey }).catch(console.log);
        setVerified(!!decrypted)
      } catch (e) {
        setVerified(false)
      }

      channel.onerror = () => {
        setWaiting(false)
        setConnection(null)
        setVerified(false)
      }

      channel.onclose = () => {
        setWaiting(false)
        setConnection(null)
        setVerified(false)
      }
    }, 1000)
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