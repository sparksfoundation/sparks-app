import React from "react";
import { Button, Card, Input, P } from "sparks-ui";
import { WebRTC } from "sparks-sdk/channels/WebRTC";
import { userStore } from "@stores/userStore";

interface IProps {
  user: any;
}

interface IState {
  address: string;
  waiting: boolean;
  connection: any;
  stream: any;
}

class WebRTCVideo extends React.Component<IProps, IState>  {
  helpMsgs: any[];
  user: any;
  videoRef: any;

  constructor(props: IProps) {
    super(props);

    this.user = props.user;

    this.state = {
      address: "",
      waiting: false,
      connection: null,
      stream: null,
    } as {
      address: string,
      waiting: boolean,
      connection: any,
      stream: any,
    };

    this.helpMsgs = [
      { message: "Welcome to the WebRTC Data Channel demo. This is a simple example of how to use the SDK WebRTC Channels to connected two identities and open a video call." },
      { message: "It's more that just P2P video, here two KERI identities both have a proof of the connection being established." },
      { message: "This means proof that a conversation was had by two specific identities at a specific time and data." },
      { message: "Once credential functionaliy is added to the SDK, this will also be a powerful way to send and receive credentials, predicates, proofs etc.. between identities." },
      { message: "Once you have an auditable, non-repudable channel things like job interviews, e-commerce chat support, P2P agreements, mentorship, e-professional services etc... become possible, even in the dark forest of pseudo anonymous web3." },
      { message: "Copy and share your identifier (shown below) with a peer to allow them to call you:" },
      { message: this.user.identifier },
    ]

    this.connectToPeer = this.connectToPeer.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.videoRef = React.createRef();
  }

  async connectToPeer() {
    if (!this.state.address || this.state.connection) return
    this.setState({ waiting: true })
    const conn = new WebRTC({
      peerIdentifier: this.state.address,
      spark: this.user,
    });

    await conn.open();
    
  }

  async disconnect(initiated = true) {
    if (!this.state.connection) return

    if (initiated) {
      this.setState({ waiting: true })
      await this.state.connection.close()
    }

    this.videoRef.current.srcObject.getTracks().forEach((track: any) => {
      track.stop()
    })

    this.setState({
      connection: null,
      stream: null,
      waiting: false,
    })
  }

  componentDidUpdate() {
    if (this.state.stream && this.videoRef.current) {
      this.videoRef.current.srcObject = this.state.stream;
    }
  }

  componentDidMount() {
    WebRTC.handleOpenRequests(async ({ resolve }: { resolve: any }) => {
      const conn = await resolve()
      conn.onclose = () => this.disconnect(false)
      this.setState({ connection: conn })
    }, {
      spark: this.user,
    })
  }

  render() {
    return (
      <Card className="h-full">
        <div className="flex flex-col h-full gap-4">
          <Card className="w-full max-h-full" shade="light">
            {this.state.connection && this.state.stream ? (
              <div className="flex flex-col gap-2 items-center">
                <video ref={this.videoRef} autoPlay />
                <Button disabled={this.state.waiting} onClick={() => this.disconnect()}>disconnect</Button>
              </div>
            ) : (
              <div className="overflow-y-auto overflow-hidden h-full">
                {this.helpMsgs.map(({ message }: { message: string }, index: number) => (
                  <div className="dark:bg-bg-200 dark:text-fg-900 bg-bg-50 text-fg-900 p-3 rounded-lg mb-4 break-all" key={'help' + index}>
                    {message}

                  </div>
                ))}
                <div className="bg-primary-600 flex flex-col p-6 rounded-lg">
                  <P className="text-fg-100">or enter a peer's identifier and hit 'Enter' to connect to them and open a chat.</P>
                  <Input
                    disabled={this.state.waiting}
                    className="mt-4"
                    placeholder="Enter a peer's identifier or copy yours to connect"
                    onKeyUp={e => { if (e.key === 'Enter') { this.connectToPeer() } }}
                    value={this.state.address} onChange={e => this.setState({ address: e.target.value })}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </Card>
    )
  }
}

const withUser = (BaseComponent: any) => (props: any) => {
  const user = userStore((state: any) => state.user);
  return <BaseComponent {...props} user={user} />;
};
export const WebRTCVideoChannel = withUser(WebRTCVideo);
