import { create } from "zustand";
import { createSelectors } from "./createSelectors";
import { WebRTC } from "sparks-sdk/channels/ChannelTransports";
import { channelStoreActions } from "./channels";
import { ChannelRequestEvent } from "sparks-sdk/channels/ChannelEvent";
import { webRTCCallToaster } from "@components/Toast";

type Nullable<T> = T | null;

interface MessengerStore {
  channel: Nullable<WebRTC>,
  waiting: boolean,
  messages: any[],
  call: Nullable<any>,
}

export const messengerStore = create<MessengerStore>(() => ({
  channel: null,
  waiting: false,
  messages: [],
  call: null,
}));

export const useMessengerStore = createSelectors(messengerStore)

function getChannelMessages(channel: WebRTC) {
  return channel.eventLog
    .filter(event => {
      const isOurs = event.type === channel.eventTypes.MESSAGE_REQUEST && event.request;
      const isTheirs = event.type === channel.eventTypes.MESSAGE_REQUEST && event.response;
      return isOurs || isTheirs;
    })
}

export const messengerStoreActions = {
  setWaiting: (waiting: boolean) => {
    messengerStore.setState({ waiting });
  },
  setChannel: async (channel: Nullable<WebRTC>) => {
    // get current channel
    const currentChannel = messengerStore.getState().channel;
    if (currentChannel) {
      currentChannel.removeAllListeners();
      messengerStore.setState({ channel: null });
    }

    if (!channel) {
      messengerStore.setState({ channel: null });
      return;
    }

    channel.on([
      channel.eventTypes.MESSAGE_REQUEST,
      channel.eventTypes.MESSAGE_CONFIRM,
    ], async () => {
      const messages = getChannelMessages(channel);
      messengerStore.setState({ messages, waiting: false });
      await channelStoreActions.save(channel);
    })

    channel.on([
      channel.eventTypes.CLOSE_REQUEST,
      channel.eventTypes.CLOSE_CONFIRM,
    ], async () => {
      messengerStore.setState({ channel: null, waiting: false });
    });

    channel.on([
      channel.eventTypes.CALL_REQUEST,
      channel.eventTypes.CALL_CONFIRM,
      channel.eventTypes.HANGUP_REQUEST,  
      channel.eventTypes.HANGUP_CONFIRM,
    ], async (event) => {
      messengerStore.setState({ channel, call: channel.state.call, waiting: false });
    });

    channel.handleCallRequest = async (request) => {
      messengerStore.setState({ waiting: true });
      return new Promise(async (resolve, reject) => {
        webRTCCallToaster({
          event: request as ChannelRequestEvent,
          resolve,
          reject,
        });
      });
    }

    if (channel.state.streamable === null) {
      await channel.setStreamable();
    }

    const messages = getChannelMessages(channel);
    messengerStore.setState({ channel, messages });
  }
}