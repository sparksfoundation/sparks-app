import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useUser } from "@stores/user";
import { useEffect, useState } from "react";
import { WebRTC } from "sparks-sdk";
import { Button, Card, Input } from "sparks-ui";

export const WebRTCChannels = () => {
  const user = useUser(state => state.user);
  const [messages, setMessages] = useState([]) as any
  const [receiving, setReceiving] = useState(false) as any
  const [connection, setConnection] = useState(null) as any

  async function allowConnections() {

  }

  async function connectToPeer() {

  }

  useEffect(() => {
    if (!user || connection) return

    WebRTC.receive(async ({ resolve }: { resolve: any }) => {
      const conn = await resolve()
      setConnection(conn)
    }, {
      spark: user,
    })
  }, [user])

  return (
    <Card className="h-full">
      <div className="flex flex-col h-full gap-4">
        <Card className="w-full h-full" shade="light">
          <video></video>
        </Card>
        <div className="flex gap-4">
          <Input />
          <Button><PaperAirplaneIcon height={20} /></Button>
        </div>
      </div>
    </Card>
  )
}