import { Button, Card, H5, P, clsxm } from "sparks-ui"
import { useUser } from "@stores/user"
import { useState } from "react"

export const SparksFoundation = ({ connectionWaiting = false }) => {
  const { user } = useUser(state => ({ user: state.user as any }))
  const [connection, setConnection] = useState(null) as any
  const [verified, setVerified] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [request, setRequest] = useState(connectionWaiting) as any

  async function connect({ url }: { url?: string }) {
    if (!user) return
    const target = request && window.opener ? window.opener : undefined;
    user.postMessage.open({
      url,
      target,
      onOpen: ({ }: any, conn: any) => {
        setWaiting(false)
        setConnection(conn)
        conn.message({ name: user?.name }).then((signature: string) => {
          const { cid, message } = user.verify({ signature, publicKey: conn.publicKeys.signing })
          // confirm that the message intented was recieved, by the right user, on the right channel
          if (cid === conn.cid && message.name === user.name) {
            setVerified(true)
          }
        })
      },
      onClose: () => {
        setWaiting(false)
        setVerified(false)
        setConnection(null)
      }
    })
  }

  async function disconnect() {
    setWaiting(true)
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