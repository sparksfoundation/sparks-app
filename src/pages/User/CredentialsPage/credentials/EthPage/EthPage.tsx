import { Button, Card } from "sparks-ui";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export function EthPage() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  if (isConnected)
    return (
      <Card>
        Connected to {address}
        <Button onClick={() => disconnect()}>Disconnect</Button>
      </Card>
    )

  return <Button onClick={() => connect()}>Connect Wallet</Button>
}