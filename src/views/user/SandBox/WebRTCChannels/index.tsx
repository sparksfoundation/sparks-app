import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useUser } from "@stores/user";
import { useEffect, useState } from "react";
import { Button, Card, Input, P, clsxm } from "sparks-ui";
import { WebRTC } from "sparks-sdk";

export const WebRTCChannels = () => {
  const user = useUser(state => state.user);
  const [peerId, setPeerId] = useState("") as any
  const [waiting, setWaiting] = useState(false) as any
  const [message, setMessage] = useState("") as any
  const [messages, setMessages] = useState([]) as any
  const [connection, setConnection] = useState(null) as any
  const help = [
    { message: "Welcome to the WebRTC Channels sandbox. This is a simple example of how to use the WebRTC Channels SDK to connected two identities and send messages." },
    { message: "It's more that just P2P chat, here two KERI identities both have a proof of the connection being established, and the messages sent and received." },
    { message: "This means two-way non-repudiation, (sender can't deny sending) and the ability to prove that a message was sent and received by a specific identity." },
    { message: "This cryptographic chain of evidence can be very powerful for many applications and it provides a basis for trusted agreements between two parties." },
    { message: "Once credential functionaliy is added to the SDK, this will also be a powerful way to send and receive credentials, predicates, proofs etc.. between identities." },
    { message: "Once you have an auditable, non-repudable channel things like job interviews, e-commerce chat support, P2P agreements, mentorship, e-professional services etc... become possible, even in the dark forest of pseudo anonymous web3." },
    { message: "Copy and share your identifier (shown below) with a peer to allow them to connect:" },
    { message: user.identifier },
  ]

  async function connectToPeer() {
    console.log('connecting to peer', peerId)
    if (!peerId) return
    setWaiting(true);
    const connection = new WebRTC({
      peerId: peerId,
      spark: user,
    });

    console.log('opening', connection)
    await connection.open();
    setPeerId("");
    setConnection(connection);
    setWaiting(false);
  }

  async function sendMessage() {
    if (!message) return
    const receipt = await connection.send(message)
    setMessages([...messages, { message, receipt, mine: true }])
    setMessage("")
  }

  useEffect(() => {
    if (!user || connection) return
    WebRTC.receive(async ({ resolve }: { resolve: any }) => {
      const connection = await resolve()
      connection.onmessage = (payload: any) => {
        setMessages([...messages, { message: payload.message, receipt: payload.receipt, mine: false }])
      }
      setConnection(connection)
    }, {
      spark: user,
    })
  }, [user])

  return (
    <Card className="h-full">
      <div className="flex flex-col h-full gap-4">
        <Card className="w-full h-full" shade="light">
          <div className="overflow-y-auto h-full pr-4">
            {connection ? (
              messages.map((({ message, mine }: { message: string, receipt?: string, mine: boolean }, index: number) => (
                <div className={clsxm("dark:bg-bg-200 dark:text-fg-900 bg-bg-100 text-fg-900 p-3 rounded-lg mb-4", !mine && "bg-primary-500 text-fg-200 dark:bg-primary-500 dark:text-fg-200 text-right")} key={index}>
                  {message}
                </div>
              )))
            ) : (
              <>
                {help.map(({ message }: { message: string }, index: number) => (
                  <div className="dark:bg-bg-200 dark:text-fg-900 bg-bg-50 text-fg-900 p-3 rounded-lg mb-4" key={index}>
                    {message}
                  </div>
                ))}
                <div className="bg-primary-600 flex flex-col p-6 rounded-lg">
                  <P className="text-fg-100">or enter a peer's identifier and hit 'Enter' to connect to them and open a chat.</P>
                  <Input 
                    disabled={waiting} 
                    className="mt-4"
                    placeholder="Enter a peer's identifier or copy yours to connect" 
                    onKeyUp={e => { if(e.key === 'Enter') { connectToPeer() }}} 
                    value={peerId} onChange={e => setPeerId(e.target.value)} 
                  />
                </div>
              </>
            )}
          </div>
        </Card>
        <div className="flex gap-4">
          <Input disabled={!connection} placeholder="send message" value={message} onChange={e => setMessage(e.target.value)} />
          <Button disabled={!connection} onClick={sendMessage}><PaperAirplaneIcon height={20} /></Button>
        </div>
      </div>
    </Card>
  )
}
