import { create } from "zustand";
import { createSelectors } from "./createSelectors";
import { WebRTC } from "sparks-sdk/channels/ChannelTransports";

type Nullable<T> = T | null;

interface MessengerStore {
    channel: Nullable<WebRTC>,
    waiting: boolean,
    streamable: boolean,
}

export const messengerStore = create<MessengerStore>(() => ({
    channel: null,
    waiting: false,
    streamable: false,
    messages: [], // decrypted messages
}));

export const useMessengerStore = createSelectors(messengerStore)

export const messengerStoreActions = {
    setChannel: async (channel: Nullable<WebRTC>) => {
        // get current channel
        const currentChannel = messengerStore.getState().channel;
        if (currentChannel) {
            currentChannel.removeAllListeners();
        }
        // TODO - listen for message events and update decrypted messages in the store's state for chat rendering
        messengerStore.setState({ channel });
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