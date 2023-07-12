import { toast } from "react-toastify";
import { create } from "zustand";
import { inviteToaster } from "@components/CallInviteToast";
import { createSelectors } from "./createSelectors";
import { channelActions } from "./channelStore";
import { HttpFetch, PostMessage, WebRTC, WebRTCMediaStreams } from "sparks-sdk/channels/ChannelTransports";
import { ChannelEventData } from "node_modules/sparks-sdk/dist/channels/ChannelEvent/types";

type Channel = WebRTC | PostMessage | HttpFetch;

type Nullable<T> = T | null;

interface ChatStore {
  channel: Nullable<Channel>,
  messages: { message: ChannelEventData; event: any; }[],
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

async function unlockMessages(channel: Channel): Promise<{ message: ChannelEventData; event: any; }[]> {
  const isMyMessage = (event: any) => event.response && event.type === channel.eventTypes.MESSAGE_CONFIRM;
  const isTheirMessage = (event: any) => event.response && event.type === channel.eventTypes.MESSAGE_REQUEST;
  const messages = channel.eventLog
    .filter((event: any) => isMyMessage(event) || isTheirMessage(event))
    .map(async (event: any) => {
      await channel.openEvent(event);
      return { message: event.data, event };
    });
  return Promise.all(messages);
}

export const chatStoreActions = {
  setChannel: async (channel: Channel) => {
    chatStore.setState({ waiting: true });
    await channelActions.add(channel);
    const streamable = await isStreamable();
    const messages = await unlockMessages(channel);
    chatStore.setState({ channel, messages, streamable, waiting: false });
  },
  startChat: async (channel: WebRTC) => {
    chatStore.setState({ waiting: true });
    await channelActions.add(channel);
    const streamable = await isStreamable();
    const messages = await unlockMessages(channel);

    const listener = async (event: any) => {
      switch (event.type) {
        case channel.eventTypes.CLOSE_REQUEST: case channel.eventTypes.CLOSE_CONFIRM:
          await chatStoreActions.closeChat();
          channel.off(event.types, listener);
          break;
        case channel.eventTypes.MESSAGE_REQUEST:
          if (event.sealed) await channel.openEvent(event);
          chatStore.setState({ messages: [
            ...chatStore.getState().messages, 
            { message: event.data, event }
          ], waiting: false });
          break;
        case channel.eventTypes.MESSAGE_CONFIRM:
          if (event.sealed) await channel.openEvent(event);
          chatStore.setState({ messages: [
            ...chatStore.getState().messages, 
            { message: event.data.data, event }
          ], waiting: false });
          break;
      }
    }

    channel.on([
      channel.eventTypes.MESSAGE_REQUEST,
      channel.eventTypes.MESSAGE_CONFIRM,
      channel.eventTypes.CLOSE_REQUEST,
      channel.eventTypes.CLOSE_CONFIRM,
    ], listener);

    channel.handleHangup = () => {
      chatStore.setState({
        streams: null,
        waiting: false,
      });
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
        identifier: channel.peer.identifier as string,
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
    channel.hangup();
  },
  sendMessage: (message: string) => {
    const channel = chatStore.getState().channel as WebRTC;
    chatStore.setState({ waiting: true })
    channel.message(message);
  },
  closeChat: async () => {
    chatStore.setState({ waiting: true });
    chatStore.setState({ channel: null, waiting: false });
  }
}
