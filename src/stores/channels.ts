import { PostMessage, FetchAPI, WebRTC, ChannelId } from "sparks-sdk/channels";
import { create } from 'zustand';

type Channels = PostMessage | FetchAPI | WebRTC;

export interface ChannelsStore {
  channels: Channels[],
}

export const usePostMessage = create<ChannelsStore>((set, get) => ({
  channels: [],
  addChannel: (channel: Channels) => {
    set({ channels: [...get().channels, channel] })
  },
  removeChannel: (channel: Channels) => {
    set({ channels: get().channels.filter(c => c !== channel) })
  },
  getChannel: (channelId: ChannelId) => {
    return get().channels.find(c => c.channelId === channelId);
  }
}))
