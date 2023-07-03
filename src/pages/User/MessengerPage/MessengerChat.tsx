import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { User } from "@stores/user";
import { Component, FormEvent } from "react";
import { ChannelEventType, WebRTC } from "sparks-sdk/channels";
import { Button, Card, Input, clsxm } from "sparks-ui";

interface MessengerChatProps {
  channel: WebRTC;
  user: User;
  handleCloseChat: Function;
}

interface MessengerChatState {
  waiting: boolean;
  message: string;
  messages: any[];
  unlocking: boolean;
  channel: WebRTC;
}

export class MessengerChat extends Component<MessengerChatProps, MessengerChatState> {
  constructor(props: { channel: WebRTC, handleCloseChat: Function, user: User }) {
    super(props);

    this.state = {
      message: '',
      waiting: false,
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

      channel.onmessage = (event) => {
        this.setState({ messages: [...this.state.messages, { message: event.data, event }] });
      }
      channel.onerror = (error) => {
        console.log('channel error', error)
      }
      channel.onclose = () => {
        this.props.handleCloseChat();
      }
    });
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
        {!this.state.unlocking ? (
          <>
            <Card className="h-full p-2">
              {messages.map((messageData, index) => {
                const { event: { type }, message } = messageData;
                const ours = type === ChannelEventType.MESSAGE_CONFIRMATION;
                return (
                  <div
                    key={index}
                    className={clsxm(
                      "flex flex-col gap-1 p-2 text-sm mb-2 rounded-sm whitespace-pre-wrap break-all",
                      ours && " bg-primary-500 text-fg-200 dark:bg-primary-500 dark:text-fg-200",
                      !ours && " bg-bg-100/70 text-fg-700 dark:bg-bg-800 dark:text-fg-200",
                    )}
                  >
                    {message}
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
        ) : <></>}
      </>
    );
  }
}
