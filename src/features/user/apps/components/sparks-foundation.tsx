import sparksfoundation from '../assets/covers/sparksfoundation.png'
import { Button, Card, H5, P } from "sparks-ui"
import { useUser } from "@stores/user"
import { useState } from "react"
import { CheckBadgeIcon } from '@heroicons/react/24/solid'

export const SparksFoundation = () => {
  const { user } = useUser(state => ({ user: state.user as any }))
  const [connected, setConnected] = useState(false)
  const [verified, setVerified] = useState(false)

  async function launch() {
    const url = import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://sparks.foundation'
    user.postMessage.open({
      target: url,
      onOpen: ({}: any, conn: any) => {
        conn.message({ name: user?.name }).then((signature: string) => {
          const { cid, message } = user.verify({ signature, publicKey: conn.publicKeys.signing })
          // confirm that the message intented was recieved, by the right user, on the right channel
          if (cid === conn.cid && message.name === user.name) {
            setVerified(true)
          }
        })
        setConnected(true)
      },
      onClose: () => {
        setVerified(false)
        setConnected(false)
      }
    })
  }

  return (
    <Card className="p-0 max-w-sm" shade='light'>
      <img src={sparksfoundation} />
      <div className="p-4">
        <H5 className="text-center mb-2">SPARKS Foundation</H5>
        <P className="text-sm text-justify mb-4">Provides an example of personalized content experience based on your information, no login or server side data required.</P>
        <Button onClick={launch} className='flex justify-center items-center' fullWidth disabled={connected}>
          {verified ? <CheckBadgeIcon className='h-4 w-4 mr-2' /> : <></>}
          {connected ? verified ? 'data verified recieved' : 'connected' : 'launch'}
        </Button>
      </div>
    </Card>
  )
}