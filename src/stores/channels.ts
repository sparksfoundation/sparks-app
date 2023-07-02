import { storage } from './indexedDb';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import { ChannelId, PostMessage, WebRTC } from 'sparks-sdk/channels';
import { useUser } from './user';

type Channel = WebRTC | PostMessage;

type EncryptedChannelData = string;

export interface ChannelStore {
  channels: { [key: ChannelId]: Channel };
  encryptedChannelsData: { [key: ChannelId]: EncryptedChannelData };

  addChannel: (channel: Channel) => Promise<void>;
  saveChannelData: (channel: Channel) => Promise<void>;
  removeChannel: (channel: Channel) => void;
}

export const useChannels = create<ChannelStore>()(
  persist((set, get) => ({
    channels: {},
    encryptedChannelsData: {},
    addChannel: async (channel: Channel) => {
      if (!channel.cid) return;
      const user = useUser.getState().user;
      if (!user) return;
      const channelData = get().encryptedChannelsData[channel.cid];
      if (channelData) {
        const decrypted = await useUser.getState().user.decrypt({ data: channelData });
        await channel.import(decrypted as Record<string, any>);
      }
      set({ channels: { ...get().channels, [channel.cid]: channel } });
      get().saveChannelData(channel);
    },
    removeChannel: (channel: Channel) => {
      // remove from encrypted & channels
      const update = { ...get().channels };
      delete update[channel.cid];
      set({ channels: update });

      const encryptedUpdate = { ...get().encryptedChannelsData };
      delete encryptedUpdate[channel.cid];

      set({ encryptedChannelsData: encryptedUpdate });
    },
    saveChannelData: async (channel: Channel) => {
      if (!channel.cid) return;
      const user = useUser.getState().user;
      const data = await channel.export();
      console.log('saving data', data.cid);
      console.log('saving data', data.peer);
      const encryptedData = await user.encrypt({ data });
      const encryptedChannelsData = get().encryptedChannelsData;
      encryptedChannelsData[channel.cid] = encryptedData;
      set({ encryptedChannelsData });
    }
  }), {
    name: 'channels',
    version: 2,
    storage: createJSONStorage(() => storage),
    partialize: (state) => ({ encryptedChannelsData: state.encryptedChannelsData }),
  })
);

async function saveAllChannels () {
  const channels = useChannels.getState().channels;
  for (const channel of Object.values(channels)) {
    if (!channel.cid) continue;
    await useChannels.getState().saveChannelData(channel);
  }
}

useChannels.persist.onFinishHydration((state) => {
  const unSubUser = useUser.subscribe(async (userState) => {
    const user = userState.user;
    if (!user || !user.identifier) return;
    for(const entries of Object.entries(state.encryptedChannelsData)) {
      const [cid, encryptedData] = entries;
      if (!cid || !encryptedData) continue;
      const channelData = await user.decrypt({ data: encryptedData }) as any;
      if (!channelData.cid) continue;
      const channel = new WebRTC({ spark: user, ...channelData });
      useChannels.getState().addChannel(channel);
    }
    unSubUser();
  })
});

window.addEventListener('beforeunload', saveAllChannels);
