import sparksfoundation from '../assets/covers/sparksfoundation.png'
import { Button, Card, H5, P } from "sparks-ui"
// @ts-ignore
import { useUser } from "@stores/user"
import { useState } from "react"
import { Identity, forge, PostMessage } from 'sparks-sdk'

export const SparksFoundation = () => {
    const { user } = useUser(state => ({ user: state.user }))
    const [connected, setConnected] = useState(false)
    async function launch() {
        const identity = new Identity()
        identity.incept({ keyPairs: forge.random(), nextKeyPairs: forge.random() })
        const channel = identity.addConnection(PostMessage)
        const url = import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://sparks.foundation'
        await channel.connect({ url })
        console.log(channel)
        if (channel && !!user?.name) {
            setConnected(true)
            channel.on('disconnected', () => {
                console.log('what')
                setConnected(false)
            })
            channel.send({
                name: user.name
            })
        }
    }

    return (
        <Card className="p-0 max-w-sm" shade='light'>
            <img src={sparksfoundation} />
            <div className="p-4">
                <H5 className="text-center mb-2">SPARKS Foundation</H5>
                <P className="text-sm text-justify mb-4">Provides an example of personalized content experience based on your information, no login or server side data required.</P>
                <Button onClick={launch} fullWidth disabled={connected}>
                    {connected ? 'connected' : 'launch'}
                </Button>
            </div>
        </Card>
    )
}