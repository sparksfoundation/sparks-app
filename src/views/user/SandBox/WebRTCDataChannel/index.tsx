import { InformationCircleIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { Fragment } from "react";
import { Button, Card, Input, P, clsxm } from "sparks-ui";
import { WebRTC } from "sparks-sdk/channels/WebRTC";
import { User, userStore } from "@stores/refactor/userStore";
import { ChannelEventType } from "sparks-sdk/channels";

interface IProps {
  user: User;
}

interface IState {
  peerIdentifier: string;
  waiting: boolean;
  message: string;
  messages: any[];
  connection: WebRTC | null;
}

class WebRTCChat extends React.Component<IProps, IState>  {
  helpMsgs: any[];
  user: User;

  constructor(props: IProps) {
    super(props);

    this.user = props.user;
    this.set = false;

    this.state = {
      peerIdentifier: "",
      waiting: false,
      message: "",
      messages: [],
      connection: null,
    };

    this.helpMsgs = [
      { message: "Welcome to the WebRTC Channels sandbox. This is a simple example of how to use the WebRTC Channels SDK to connected two identities and send messages." },
      { message: "It's more that just P2P chat, here two KERI identities both have a proof of the connection being established, and the messages sent and received." },
      { message: "This means two-way non-repudiation, (sender can't deny sending) and the ability to prove that a message was sent and received by a specific identity." },
      { message: "This cryptographic chain of evidence can be very powerful for many applications and it provides a basis for trusted agreements between two parties." },
      { message: "Once credential functionaliy is added to the SDK, this will also be a powerful way to send and receive credentials, predicates, proofs etc.. between identities." },
      { message: "Once you have an auditable, non-repudable channel things like job interviews, e-commerce chat support, P2P agreements, mentorship, e-professional services etc... become possible, even in the dark forest of pseudo anonymous web3." },
      { message: "Copy and share your identifier (shown below) with a peer to allow them to connect:" },
      { message: this.user.identifier },
    ]

    this.connectToPeer = this.connectToPeer.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.receiveMessage = this.receiveMessage.bind(this)
  }

  async connectToPeer() {
    if (!this.state.peerIdentifier || this.state.connection) return
    this.setState({ waiting: true })

    const conn = new WebRTC({
      peerIdentifier: this.state.peerIdentifier,
      spark: this.user,
    });

    await conn.open();

    conn.on(ChannelEventType.MESSAGE, (payload: any) => {
      const { timestamp, message, messageId } = payload
      this.setState({
        messages: [...this.state.messages, { timestamp, message, messageId, mine: false }]
      })
    })

    this.setState({
      waiting: false,
      peerIdentifier: "",
      connection: conn,
    })
  }

  async sendMessage() {
    if (!this.state.message) return;
    if (!this.state.connection) return;
    this.setState({ waiting: true });
    const receipt = await this.state.connection.message(this.state.message);
    const { timestamp, metadata: { mid } } = receipt;
    this.setState({
      messages: [...this.state.messages, { timestamp, message: this.state.message, messageId: mid, receipt: receipt.data.receipt, mine: true }],
      message: "",
      waiting: false,
    })
  }

  async receiveMessage(payload: any) {
    const { timestamp, data, metadata: { mid } } = payload
    this.setState({
      messages: [...this.state.messages, { timestamp, message: data, messageId: mid, mine: false }]
    })
  }

  public set: boolean;
  componentDidMount() {
    if (this.set) return;
    this.set = true;
    WebRTC.handleOpenRequests(async ({ resolve }: { resolve: any }) => {
      const conn = await resolve()
      conn.onmessage = this.receiveMessage
      this.setState({ connection: conn })
    }, {
      spark: this.user,
    })
  }

  render() {
    return (
      <Card className="h-full">
        <div className="flex flex-col h-full gap-4">
          <Card className="w-full h-full" shade="light">
            <div className="overflow-y-auto overflow-hidden h-full pr-4">
              {this.state.connection !== null ? (
                this.state.messages.map((({ messageId, timestamp, message, receipt, mine, opened }: { messageId: string, timestamp: number, message: string, receipt?: string, mine: boolean, opened: boolean }, index: number) => (
                  <Fragment key={'msg' + index}>
                    <div className={clsxm("dark:bg-bg-200 dark:text-fg-900 bg-bg-50 text-fg-900 p-3 rounded-lg mb-4 break-all", !mine && "bg-primary-500 text-fg-200 dark:bg-primary-500 dark:text-fg-200 text-right")}>
                      {message}
                      <InformationCircleIcon className={mine ? "float-right" : "float-left"} height={18} onClick={() => this.setState({
                        messages: this.state.messages.map((msg: any, i: number) => {
                          if (i === index) {
                            return { ...msg, opened: !msg.opened }
                          }
                          return msg
                        })
                      })} />
                      <div className={clsxm("overflow-hidden max-h-0", opened && "mt-4 max-h-none")}>
                        <P className={clsxm("text-xs overflow-hidden mb-1 text-left text-ellipsis whitespace-nowrap dark:text-fg-900 text-fg-900", !mine && "text-fg-200 dark:text-fg-200")}><span className="font-bold">peer:</span> {this.state.connection?.address}</P>
                        <P className={clsxm("text-xs overflow-hidden mb-1 text-left text-ellipsis whitespace-nowrap dark:text-fg-900 text-fg-900", !mine && "text-fg-200 dark:text-fg-200")}><span className="font-bold">messageId:</span> {messageId}</P>
                        <P className={clsxm("text-xs overflow-hidden mb-1 text-left text-ellipsis whitespace-nowrap dark:text-fg-900 text-fg-900", !mine && "text-fg-200 dark:text-fg-200")}><span className="font-bold">timestamp:</span> {timestamp}</P>
                        {receipt && (
                          <P className={clsxm("text-xs overflow-hidden mb-1 text-left text-ellipsis whitespace-nowrap dark:text-fg-900 text-fg-900", !mine && "text-fg-200 dark:text-fg-200")}><span className="font-bold">receipt:</span> {receipt}</P>
                        )}
                      </div>
                    </div>
                  </Fragment>
                )))
              ) : (
                <>
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
                      value={this.state.peerIdentifier} onChange={e => this.setState({ peerIdentifier: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </Card>
          <div className="flex gap-4">
            <Input
              disabled={!this.state.connection}
              placeholder="send message"
              value={this.state.message}
              onKeyUp={e => { if (e.key === 'Enter') { this.sendMessage() } }}
              onChange={e => this.setState({ message: e.target.value })}
            />
            <Button disabled={!this.state.connection} onClick={this.sendMessage}><PaperAirplaneIcon height={20} /></Button>
          </div>
        </div>
      </Card>
    )
  }

}

const withUser = (BaseComponent: any) => (props: any) => {
  const user = userStore((state: any) => state.user);
  return <BaseComponent {...props} user={user} />;
};
export const WebRTCDataChannel = withUser(WebRTCChat);
