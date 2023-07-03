import { storage } from './indexedDb';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import { ChannelId, PostMessage, WebRTC } from 'sparks-sdk/channels';
import { userStore } from './refactor/userStore';

type Channel = WebRTC | PostMessage;

type EncryptedChannelData = string;
type DecryptedChannelData = Record<string, any>;

interface ChannelStore {
  channels: { [key: ChannelId]: Channel };
  decryptedChannelsData: { [key: ChannelId]: DecryptedChannelData };
  encryptedChannelsData: { [key: ChannelId]: EncryptedChannelData };

  addChannel: (channel: Channel) => Promise<void>;
  removeChannel: (channel: Channel) => void;
  exportChannel: (channel: Channel) => Promise<void>;
}

const useChannels = create<ChannelStore>()(
  persist((set, get) => ({
    channels: {},
    decryptedChannelsData: {},
    encryptedChannelsData: {},

    addChannel: async (channel: Channel) => {
      const user = userStore.getState().user;
      if (!channel.cid || !user || !user.identifier) return;
      const channelData = get().decryptedChannelsData[channel.cid];
      if (channelData !== undefined) {
        await channel.import(channelData as Record<string, any>);
      }
      set({ channels: { ...get().channels, [channel.cid]: channel } });
      await get().exportChannel(channel);
    },
    removeChannel: (channel: Channel) => {
      const channelUpdate = { ...get().channels };
      delete channelUpdate[channel.cid];

      const decryptedUpdate = { ...get().decryptedChannelsData };
      delete decryptedUpdate[channel.cid];
      
      const encryptedUpdate = { ...get().encryptedChannelsData };
      delete encryptedUpdate[channel.cid];
      
      set({ channels: channelUpdate });
      set({ decryptedChannelsData: decryptedUpdate });
      set({ encryptedChannelsData: encryptedUpdate });
    },
    exportChannel: async (channel: Channel) => {
      if (!channel.cid) return;
      const user = userStore.getState().user;
      if (!user || !user.identifier) return;
      const data = await channel.export();
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

async function saveAllChannels() {
  const channels = useChannels.getState().channels;
  for (const channel of Object.values(channels)) {
    await useChannels.getState().exportChannel(channel);
  }
}

useChannels.persist.onFinishHydration((state) => {
  const unSubUser = userStore.subscribe(async (userState) => {
    const user = userState.user;
    if (!user || !user.identifier) return;
    for (const entries of Object.entries(state.encryptedChannelsData)) {
      const [cid, encryptedData] = entries;
      if (!cid || !encryptedData) continue;
      const channelData = await user.decrypt({ data: encryptedData }) as any;
      if (!channelData.cid) continue;
      useChannels.getState().decryptedChannelsData[cid] = channelData;
      const channel = new WebRTC({
        spark: user,
        ...channelData,
      });
      useChannels.getState().channels[cid] = channel;        
    }
    unSubUser();
  })
});

window.addEventListener('beforeunload', saveAllChannels);
