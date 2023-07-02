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
      console.log('adding', channel.cid)
      if (!channel.cid) return;
      const channelData = get().encryptedChannelsData[channel.cid];
      if (channelData) {
        await channel.import({ data: channelData });
      }
      set({ channels: { ...get().channels, [channel.cid]: channel } });
      get().saveChannelData(channel);
    },
    removeChannel: (channel: Channel) => {
      // remove from encrypted & channels
      delete get().channels[channel.cid];
      delete get().encryptedChannelsData[channel.cid];
    },
    saveChannelData: async (channel: Channel) => {
      if (!channel.cid) return;
      const user = useUser.getState().user;
      const data = await channel.export();
      console.log('saving data', data);
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
      console.log(cid, channelData)

      const channel = new WebRTC({ spark: user, ...channelData });
      useChannels.getState().addChannel(channel);
    }
    unSubUser();
  })
});

window.addEventListener('beforeunload', saveAllChannels);