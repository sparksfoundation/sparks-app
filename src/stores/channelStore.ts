import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { indexedDBStorage } from "./IndexedDB";
import { createSelectors } from "./createSelectors";
import { userStore } from "./userStore";
import { WebRTC, PostMessage, HttpFetch } from "sparks-sdk/channels/ChannelTransports";
import { ChannelId } from "sparks-sdk/channels";

type Channel = WebRTC | PostMessage | HttpFetch;

interface ChannelStore {
  channels: { [key: ChannelId]: Channel };
  _data: { [key: ChannelId]: string };
}

export const channelStore = create<ChannelStore>()(
  persist(() => ({
    channels: {},
    _data: {},
  }), {
    name: 'channels',
    version: 1,
    storage: createJSONStorage(() => indexedDBStorage),
    partialize: (state) => ({
      _data: state._data,
    }),
  })
);

export const useChannelStore = createSelectors(channelStore);

function isInstance(channel: any): channel is Channel {
  const isWebRTC = channel instanceof WebRTC;
  const isPostMessage = channel instanceof PostMessage;
  const isHttpFetch = channel instanceof HttpFetch;
  return isWebRTC || isPostMessage || isHttpFetch;
}

async function saveChannelData(channel: Channel) {
  const user = userStore.getState().user;
  if (!user) throw new Error('User not logged in');
  const data = await channel.export();
  const encrypted = await user.encrypt({ data });
  if (!encrypted) throw new Error('Could not encrypt channel data');
  channelStore.setState({
    _data: {
      ...channelStore.getState()._data,
      [channel.channelId]: encrypted,
    },
  });
}

async function addOrCreateChannel(params: {
  options?: Record<string, any>,
  channel: (new (...args: any[]) => Channel) | Channel,
}) {
  // if it's already in the store, return it
  const user = userStore.getState().user;
  if (!user) throw new Error('User not logged in');
  const { options, channel: _channel } = params;
  const channel = (isInstance(_channel) ? _channel : new _channel(options));

  let data = channelStore.getState()._data[channel.channelId];
  if (!data) {
    const raw = await channel.export();
    data = await user.encrypt({ data: raw });
  }

  // import the data if there is any
  if (channelStore.getState()._data[channel.channelId]) {
    const decrypted = await user.decrypt({ data }) as Record<string, any>;
    //if (data) await channel.import(decrypted);
  }

  // save the channel data when it changes
  channel.on([
    channel.eventTypes.OPEN_CONFIRM,
    channel.eventTypes.MESSAGE_REQUEST,
    channel.eventTypes.MESSAGE_CONFIRM,
    channel.eventTypes.CLOSE_REQUEST,
    channel.eventTypes.CLOSE_CONFIRM,
  ], async () => {
    await saveChannelData(channel)
  });


  // if (channel.status === ChannelState.OPENED) {
  //   await saveChannelData(channel);
  // }

  // add the channel and data to the store
  channelStore.setState({
    channels: {
      ...channelStore.getState().channels,
      [channel.channelId]: channel,
    },
    _data: {
      ...channelStore.getState()._data,
      [channel.channelId]: data,
    },
  });
}

export const channelActions = {
  // creates a channel instance, adds it to the store, and saves it
  // watches for events and updates the store
  create: async ({ options, channel }: { options: Record<string, any>, channel: (new (...args: any[]) => Channel) }) => {
    return addOrCreateChannel({ options, channel });
  },
  add: async (channel: Channel) => {
    return addOrCreateChannel({ channel });
  },
  // removes a channel instance, removes it from the store, and deletes it
  // stops watching for events
  remove: (channel: Channel) => {
    channelStore.setState({
      channels: Object.entries(channelStore.getState().channels)
        .filter(([channelId]) => channelId !== channel.channelId)
        .reduce((acc, [channelId, channel]) => ({ ...acc, [channelId]: channel }), {}),
      _data: Object.entries(channelStore.getState()._data)
        .filter(([channelId]) => channelId !== channel.channelId)
        .reduce((acc, [channelId, data]) => ({ ...acc, [channelId]: data }), {}),
    });
  },
}

userStore.persist.onFinishHydration(() => {
  const unSubUser = userStore.subscribe(async (userState) => {
    const user = userState.user;
    const data = channelStore.getState()._data;
    const noData = Object.keys(data).length === 0;
    if (!user || !user.identifier || noData) return;
    Object.entries(data).forEach(async ([ _, encryptedData]) => {
      const channelData = await user.decrypt({ data: encryptedData }) as any;
      if (!channelData || !channelData.channelId) return;

      const channel = new WebRTC({
        spark: user,
        ...channelData,
      });

      channelStore.setState({
        channels: {
          ...channelStore.getState().channels,
          [channel.channelId]: channel,
        },
      });
    });
    unSubUser();
  })
});
