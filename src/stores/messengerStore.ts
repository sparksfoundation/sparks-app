import { create } from "zustand";
import { createSelectors } from "./createSelectors";
import { WebRTC } from "sparks-sdk/channels/ChannelTransports";
import { ChannelRequestEvent } from "sparks-sdk/channels/ChannelEvent";

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

export const messengerStoreActions = {
    setChannel: async (channel: Nullable<WebRTC>) => {
        // get current channel
        const currentChannel = messengerStore.getState().channel;
        if (currentChannel) {
            currentChannel.removeAllListeners();
        }

        if (!channel) {
            messengerStore.setState({ channel: null });
            return;
        }

        channel.on([
          channel.eventTypes.MESSAGE_REQUEST,
          channel.eventTypes.MESSAGE_CONFIRM,
        ], async event => {
          if (!event.data && !!event.seal) {
            await channel.openEvent(event);
          }
          messengerStore.setState({ 
            messages: [...messengerStore.getState().messages, event ], 
          });
        })

        channel.on([
          channel.eventTypes.CLOSE_REQUEST,
          channel.eventTypes.CLOSE_CONFIRM,
        ], async event => {
          messengerStore.setState({ channel: null });
        })

        const messages = channel.eventLog
          .filter(event => {
            return event.type === channel.eventTypes.MESSAGE_REQUEST || event.type === channel.eventTypes.MESSAGE_CONFIRM
          })

        console.log(messages);
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