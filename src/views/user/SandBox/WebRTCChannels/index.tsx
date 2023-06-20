import { LinkIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useUser } from "@stores/user";
import { useEffect, useState } from "react";
import { Button, Card, Input, clsxm } from "sparks-ui";
import { WebRTC } from "sparks-sdk";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";

export const WebRTCChannels = () => {
  const user = useUser(state => state.user);
  const [peerId, setPeerId] = useState("") as any
  const [waiting, setWaiting] = useState(false) as any
  const [message, setMessage] = useState("") as any
  const [messages, setMessages] = useState([]) as any
  const [connection, setConnection] = useState(null) as any

  async function connectToPeer() {
    console.log('connecting to peer', peerId)
    if (!peerId) return
    setWaiting(true);
    const connection = new WebRTC({
      peerId: peerId,
      spark: user,
    })
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

  console.log(messages)

  return (
    <Card className="h-full">
      <div className="flex flex-col h-full gap-4">
        <Card className="w-full h-full" shade="light">
          {connection ? (
              messages.map((({ message, mine }: { message: string, receipt?: string, mine: boolean }, index: number) => (
                <div className={clsxm("dark:bg-bg-200 dark:text-fg-900 bg-bg-900 text-fg-200 p-3 rounded-lg mb-4", !mine && "bg-primary-500 text-fg-200 dark:bg-primary-500 dark:text-fg-200 text-right")} key={index}>
                  {message}
                </div>
              )))
          ) : (
            <div className="flex flex-row items-center justify-center h-full w-1/2 mx-auto gap-4">
              <Input disabled={waiting} placeholder="Enter a peer's identifier or copy yours to connect" value={peerId} onChange={e => setPeerId(e.target.value)} />
              <Button disabled={waiting} onClick={connectToPeer}><LinkIcon height={20} className="h-6" /></Button>
              <Button disabled={waiting} onClick={() => { navigator.clipboard.writeText(user.identifier) }}><DocumentDuplicateIcon height={20} className="h-6" /></Button>
            </div>
          )}
        </Card>
        <div className="flex gap-4">
          <Input disabled={!connection} placeholder="send message" value={message} onChange={e => setMessage(e.target.value)} />
          <Button disabled={!connection} onClick={sendMessage}><PaperAirplaneIcon height={20} /></Button>
        </div>
      </div>
    </Card>
  )
}