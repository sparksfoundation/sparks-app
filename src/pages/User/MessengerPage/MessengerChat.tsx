import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { VideoCameraIcon } from "@heroicons/react/24/solid";
import { User } from "@stores/refactor/userStore";
import { Component, FormEvent } from "react";
import { ChannelEventType, WebRTC, WebRTCMediaStreams } from "sparks-sdk/channels";
import { Button, Card, Input, P, clsxm } from "sparks-ui";
import { toast } from 'react-toastify';

interface MessengerChatProps {
  channel: WebRTC;
  user: User;
  handleCloseChat: Function;
}

interface MessengerChatState {
  waiting: boolean;
  message: string;
  messages: any[];
  streamable: boolean;
  streams: WebRTCMediaStreams | null;
  unlocking: boolean;
  channel: WebRTC;
}

export const HanleCallInvite = ({ peerIdentifier, accept, reject, closeToast }: { peerIdentifier: any, accept: Function, reject: Function, closeToast: (() => void) | undefined }) => {
  const peerId = `${peerIdentifier.slice(0, 6)}...${peerIdentifier.slice(-6)}`;

  async function handleAccept() {
    await accept();
    if (closeToast) closeToast();
  }

  return (
    <>
      <P className="text-sm font-semibold">SPARK: {peerId}</P>
      <P className="mb-2">wants to start a video call</P>
      <div className="flex flex-row justify-between gap-2">
        <Button className="grow" color="warning" onClick={() => reject()}>Reject</Button>
        <Button className="grow" color="success" onClick={handleAccept}>Accept</Button>
      </div>
    </>
  )
}


export class MessengerChat extends Component<MessengerChatProps, MessengerChatState> {
  constructor(props: { channel: WebRTC, handleCloseChat: Function, user: User }) {
    super(props);

    this.state = {
      message: '',
      waiting: false,
      streams: null,
      streamable: false,
      channel: props.channel,
      unlocking: true,
      messages: [],
    }
  }

  unlockMessages = async () => {
    const isMyMessage = (event: any) => event.response && event.type === ChannelEventType.MESSAGE_CONFIRMATION;
    const isTheirMessage = (event: any) => event.response && event.type === ChannelEventType.MESSAGE;
    const messages = this.props.channel.eventLog
      .filter((event: any) => isMyMessage(event) || isTheirMessage(event))
      .map(async (event: any) => {
        const message = await this.props.channel.getLoggedEventMessage(event);
        return { message, event };
      });

    return Promise.all(messages);
  }

  componentDidMount() {
    const { channel } = this.props;

    this.unlockMessages().then((messages) => {
      this.setState({ messages, unlocking: false });

      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices()
          .then((devices) => {
            const hasVideo = devices.some((device) => device.kind === 'videoinput');
            this.setState({ streamable: hasVideo });
          })
      }

      const unsub = channel.on([
        ChannelEventType.MESSAGE,
        ChannelEventType.MESSAGE_CONFIRMATION,
      ], async (event) => {
        const message = await this.props.channel.getLoggedEventMessage(event);
        this.setState({
          messages: [...this.state.messages, { message, event }],
          waiting: false,
          message: '',
        });
      });


      channel.on(ChannelEventType.CLOSE, () => {
        unsub();
        this.props.handleCloseChat();
      });

      channel.handleCalls = ({ accept, reject }: { accept: () => Promise<WebRTCMediaStreams>, reject: () => Promise<void> }) => {

        const acceptCalls = async () => {
          const streams: WebRTCMediaStreams = await accept();

          if (!streams) return;
          if (!streams.local || !streams.remote) return;
          this.setState({
            streams: {
              local: streams.local,
              remote: streams.remote,
            }
          });
        }

        toast(({ closeToast }) => <HanleCallInvite
          peerIdentifier={channel.peer.identifier}
          accept={acceptCalls}
          reject={reject}
          closeToast={closeToast}
        />);
      };

      channel.handleHangup = () => {
        this.setState({ streams: null });
      }
    });
  }

  sendMessage = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    this.setState({ waiting: true });
    const { channel, message } = this.state;
    this.setState({ waiting: true });
    channel.message(message);
  }

  toggleVideo = async () => {
    this.setState({ waiting: true });
    if (!this.state.streams) {
      const streams = await this.props.channel.call();
      if (!streams) return;
      if (!streams.local && !streams.remote) return;

      this.setState({
        streams: {
          local: streams.local,
          remote: streams.remote,
        }, 
        waiting: false
      });
    } else {
      this.props.channel.hangup();
      this.setState({ streams: null, waiting: false });
    }
  }

  render() {
    const { message, waiting, messages } = this.state;
    return (
      <>
        {!this.state.unlocking ? (
          <>
            <Card className="h-full p-2">
              <div className="flex flex-col h-full items-stretch">
                {this.state.streamable && this.state.streams ? (
                  <ChannelChatVideo streams={this.state.streams} />
                ) : <></>}
                <ChannelChatMessages messages={messages} />
              </div>
            </Card>
            <div className="flex gap-3 my-3">
              <Input value={message} onChange={e => this.setState({ message: e.target.value })} />
              {this.state.streamable ? (
                <Button disabled={waiting} onClick={this.toggleVideo} color={this.state.streams?.local ? "danger" : "primary"}>
                  <VideoCameraIcon className="w-6 h-6" />
                </Button>
              ) : <></>}
              <Button disabled={waiting} onClick={this.sendMessage}>
                <PaperAirplaneIcon className="w-6 h-6" />
              </Button>
            </div>
          </>
        ) : <></>}
      </>
    );
  }
}

const ChannelChatVideo = ({ streams }: { streams: WebRTCMediaStreams }) => {
  return (
    <div
      className={clsxm(
        "flex justify-center items-center bg-bg-100/70 dark:bg-bg-800/70 rounded-sm mb-2 p-1 shrink relative overflow-hidden",
      )}
    >
      <div className="h-full overflow-hidden relative">
        <video
          className="max-h-full max-w-full h-auto w-auto"
          autoPlay
          ref={(ref) => {
            if (ref) ref.srcObject = streams.remote;
          }}
        />
        <video
          autoPlay
          className="h-1/4 absolute bottom-0 right-0"
          ref={(ref) => {
            if (ref) ref.srcObject = streams.local;
          }}
        />
      </div>
    </div>
  )
}


const ChannelChatMessages = ({ messages }: { messages: any[] }) => {
  return (
    <div className="overflow-y-auto grow pr-1">
      {messages.map((messageData, index) => {
        const { event: { type }, message } = messageData;
        const ours = type === ChannelEventType.MESSAGE_CONFIRMATION;
        return (
          <div
            key={index}
            className={clsxm(
              "flex flex-col gap-1 p-2 text-sm mb-2 rounded-sm whitespace-pre-wrap break-all",
              ours && " bg-primary-500 text-fg-200 dark:bg-primary-500 dark:text-fg-200",
              !ours && " bg-bg-100/70 text-fg-700 dark:bg-bg-800/70 dark:text-fg-200",
            )}
          >
            {message}
          </div>
        )
      })}
    </div>
  )
}
