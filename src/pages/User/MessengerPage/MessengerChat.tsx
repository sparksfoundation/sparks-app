import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { Component, FormEvent } from "react";
import { ChannelEventType, WebRTC } from "sparks-sdk/channels";
import { Button, Card, Input, P, clsxm } from "sparks-ui";

interface MessengerChatProps {
  channel: WebRTC;
}

interface MessengerChatState {
  waiting: boolean;
  message: string;
  messages: any[];
  channel: WebRTC;
}

export class MessengerChat extends Component<MessengerChatProps, MessengerChatState> {
  constructor(props: { channel: WebRTC }) {
    super(props);
    this.state = {
      message: '',
      waiting: false,
      channel: props.channel,
      messages: [],
    }
  }

  componentDidMount() {
    const { channel } = this.props;
    channel.onmessage = (event) => {
      this.setState({ messages: [...this.state.messages, { message: event.data, event }] });
    }
  }

  sendMessage = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    this.setState({ waiting: true });
    const { channel, message } = this.state;
    const event = await channel.message(message);
    if (event.type === ChannelEventType.MESSAGE_CONFIRMATION) {
      this.setState({ messages: [...this.state.messages, { message, event }] });
    }
    this.setState({ waiting: false, message: '' });
  }

  render() {
    const { message, waiting, messages } = this.state;

    return (
      <>
        <Card className="h-full p-2">
          {messages.map((message, index) => {
            const ours = message.event.type === ChannelEventType.MESSAGE_CONFIRMATION;
            return (
              <div
                key={index}
                className={clsxm(
                  "flex flex-col gap-1 p-2 text-sm mb-2 rounded-sm whitespace-pre-wrap break-all",
                  ours && "bg-primary-500 text-fg-200",
                  !ours && "bg-bg-200 text-fg-800",
                )}
              >
                {message.message}
              </div>
            )
          })}
        </Card>
        <form className="flex gap-3 my-3" onSubmit={this.sendMessage}>
          <Input value={message} onChange={e => this.setState({ message: e.target.value })} />
          <Button disabled={waiting} type="submit">
            <PaperAirplaneIcon className="w-6 h-6" />
          </Button>
        </form>
      </>
    );
  }
}
