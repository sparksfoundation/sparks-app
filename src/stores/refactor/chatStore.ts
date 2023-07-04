import { toast } from "react-toastify";
import { ChannelEventType, ChannelMessageData, FetchAPI, PostMessage, WebRTC, WebRTCMediaStreams } from "sparks-sdk/channels";
import { create } from "zustand";
import { inviteToaster } from "@components/CallInviteToast";
import { createSelectors } from "./createSelectors";

type Channel = WebRTC | PostMessage | FetchAPI;

type Nullable<T> = T | null;

interface ChatStore {
  channel: Nullable<Channel>,
  messages: { message: ChannelMessageData; event: any; }[],
  streams: Nullable<{
    local: MediaStream,
    remote: MediaStream,
  }>,
  streamable: boolean,
  waiting: boolean,
}

export const chatStore = create<ChatStore>(() => ({
  channel: null,
  messages: [],
  streams: null,
  streamable: false,
  waiting: false,
}));

export const useChatStore = createSelectors(chatStore)

async function isStreamable(): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const hasVideo = devices.some((device) => device.kind === 'videoinput');
          return resolve(hasVideo);
        })
    }
  });
}

async function unlockMessages(channel: Channel): Promise<{ message: ChannelMessageData; event: any; }[]> {
  const isMyMessage = (event: any) => event.response && event.type === ChannelEventType.MESSAGE_CONFIRMATION;
  const isTheirMessage = (event: any) => event.response && event.type === ChannelEventType.MESSAGE;
  const messages = channel.eventLog
    .filter((event: any) => isMyMessage(event) || isTheirMessage(event))
    .map(async (event: any) => {
      const message = await channel.getLoggedEventMessage(event);
      return { message, event };
    });
  return Promise.all(messages);
}


export const chatStoreActions = {
  startChat: async (channel: WebRTC) => {
    chatStore.setState({ waiting: true });
    const streamable = await isStreamable();
    const messages = await unlockMessages(channel);

    channel.on([
      ChannelEventType.MESSAGE_RECEIVED,
      ChannelEventType.MESSAGE_CONFIRMATION,
    ], async (event) => {
      const isEncrypted = event.type === ChannelEventType.MESSAGE_CONFIRMATION;

      const message = isEncrypted ? await channel.getLoggedEventMessage(event) : event.data;
      if (!message) return;
      const messages = chatStore.getState().messages;
      chatStore.setState({ messages: [...messages, { message, event }], waiting: false });
    });

    channel.on([
      ChannelEventType.CLOSE,
      ChannelEventType.CLOSE_CONFIRMATION
    ], () => {
      chatStoreActions.closeChat(channel);
    }, { once: true });

    channel.handleHangup = () => {
      chatStoreActions.endCall();
    };

    channel.handleCalls = ({ accept, reject }: { accept: () => Promise<WebRTCMediaStreams>, reject: () => Promise<void> }) => {
      const acceptCalls = async () => {
        const streams: WebRTCMediaStreams = await accept();
        chatStore.setState({
          streams: streams?.local && streams?.remote ? streams : null,
          streamable: streams?.local && streams?.remote ? true : false,
        });
      }

      toast(inviteToaster({
        identifier: channel.peer.identifier,
        accept: acceptCalls,
        reject,
      }));
    };

    chatStore.setState({ channel, streamable, messages, waiting: false });
  },
  startCall: async () => {
    chatStore.setState({ waiting: true });
    const channel = chatStore.getState().channel as WebRTC;
    const streams = await channel.call();

    if (streams) {
      chatStore.setState({
        streams: {
          local: streams.local,
          remote: streams.remote,
        },
        waiting: false
      });
    } else {
      chatStore.setState({ streams: null, waiting: false });
    }
  },
  endCall: () => {
    const channel = chatStore.getState().channel as WebRTC;
    if (channel) {
      chatStore.setState({
        streams: null,
        waiting: false,
      });
    }
  },
  sendMessage: (message: string) => {
    const channel = chatStore.getState().channel as WebRTC;
    chatStore.setState({ waiting: true })
    channel.message(message);
  },
  closeChat: async (channel: Channel) => {
    setTimeout(() => {
      chatStore.setState({ channel: null });
      channel.off();
    });
  }
}
