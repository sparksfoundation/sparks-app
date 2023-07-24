import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { indexedDBStorage } from "./IndexedDB";
import { createSelectors } from "./createSelectors";
import { userStore } from "./userStore";
import { WebRTC } from "sparks-sdk/channels/WebRTC";
import { PostMessage } from "sparks-sdk/channels/PostMessage";
import { HttpFetch } from "sparks-sdk/channels/HttpFetch";
import { webRTCOpenToaster } from "@components/Toast/WebRTCOpen";
import { Paths } from "@routes/paths";
import { history } from "@routes";
import { messengerStoreActions } from "./messengerStore";

type Channel = WebRTC | PostMessage | HttpFetch;

interface ChannelStore {
  channels: { [key: string]: Channel };
  _exports: { [key: string]: string };
}

export const channelStore = create<ChannelStore>()(
  persist(() => ({
    channels: {},
    _exports: {},
  }), {
    name: 'channels',
    version: 3,
    storage: createJSONStorage(() => indexedDBStorage),
    partialize: (state) => ({
      _exports: state._exports,
    }),
  })
);

export const useChannelStore = createSelectors(channelStore);

// no watchers here, just actions
export const channelStoreActions = {
  async add(channel: Channel) {
    // if there's a channel with the same peer identifer already get it
    const existing = Object.values(channelStore.getState().channels).find((c) => {
      return c.peer.identifier === channel.peer.identifier;
    });
    if (existing) channel.import(existing.export() as any);
    await channelStoreActions.save(channel);
  },
  remove(channel: Channel) {
    const { [channel.channelId]: _, ...channels } = channelStore.getState().channels;
    const { [channel.channelId]: __, ..._exports } = channelStore.getState()._exports;
    channelStore.setState({ channels, _exports });
  },
  async save(channel: Channel) {
    const user = userStore.getState().user;
    if (!user) throw new Error('User not logged in');

    const data = channel.export();
    const encrypted = await user.encrypt({ data });
    if (!encrypted) throw new Error('Could not encrypt channel data');

    channelStore.setState({
      channels: {
        ...channelStore.getState().channels,
        [channel.channelId]: channel,
      },
      _exports: {
        ...channelStore.getState()._exports,
        [channel.channelId]: encrypted,
      },
    });
  },
  async import(data: string) {
    const user = userStore.getState().user;
    if (!user) throw new Error('User not logged in');
    const decrypted = await user.decrypt({ data }) as any;
    if (!decrypted) throw new Error('Could not decrypt channel data');

    let channel;
    switch (decrypted.type) {
      case 'WebRTC':
        channel = new WebRTC({ spark: user, ...decrypted });
        break;
      case 'PostMessage':
        channel = new PostMessage({ spark: user, ...decrypted });
        break;
      case 'HttpFetch':
        channel = new HttpFetch({ spark: user, ...decrypted });
        break;
      default:
        throw new Error('Unknown channel type');
    }

    return channelStoreActions.add(channel);
  },
}

userStore.persist.onFinishHydration(() => {
  const unSubUser = userStore.subscribe(async (userState) => {
    const user = userState.user;
    if (!user) return;

    // bring in all the channels
    const imports = channelStore.getState()._exports;
    Object.values(imports).forEach(async (data) => {
      await channelStoreActions.import(data);
    });

    // watch for incoming open requests
    WebRTC.receive(async ({ event, confirmOpen }) => {
      const addAndResolve = async () => {
        const channel = await confirmOpen() as any;
        await channelStoreActions.add(channel);
        await messengerStoreActions.setChannel(channel);
        history.navigate(Paths.USER_MESSENGER);
      }

      webRTCOpenToaster({
        event: event,
        resolve: addAndResolve,
      });
    }, { spark: user });

    unSubUser();
  });
});