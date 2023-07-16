import { create } from "zustand";
import { createSelectors } from "./createSelectors";
import { WebRTC } from "sparks-sdk/channels/ChannelTransports";
import { channelStoreActions } from "./channels";
import { ChannelEventLog } from "sparks-sdk/channels";

type Nullable<T> = T | null;

interface MessengerStore {
  channel: Nullable<WebRTC>,
  waiting: boolean,
  streamable: boolean,
  messages: any[],
}

export const messengerStore = create<MessengerStore>(() => ({
  channel: null,
  waiting: false,
  streamable: false,
  messages: [], // decrypted messages
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
      messengerStore.setState({ messages });
      await channelStoreActions.save(channel);
    })

    channel.on([
      channel.eventTypes.CLOSE_REQUEST,
      channel.eventTypes.CLOSE_CONFIRM,
    ], async (event) => {
      console.log(event);
      //channel.removeAllListeners();
      messengerStore.setState({ channel: null });
    })

    const messages = getChannelMessages(channel);
    messengerStore.setState({ channel, messages });
  }
}

window.addEventListener('load', async () => {
  const streamable = await isStreamable();
  messengerStore.setState({ streamable });
});

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