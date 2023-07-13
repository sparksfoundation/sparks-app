import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { indexedDBStorage } from "./IndexedDB";
import { createSelectors } from "./createSelectors";
import { userStore } from "./userStore";
import { WebRTC, PostMessage, HttpFetch, WebRTCParams, PostMessageParams, HttpFetchParams } from "sparks-sdk/channels/ChannelTransports";
import { ChannelId } from "sparks-sdk/channels";
import { EncryptedData } from "node_modules/sparks-sdk/dist/ciphers/types";
import { WebRTCOpen, webRTCOpenToaster } from "@components/Toast/WebRTCOpen";
import { toast } from "react-toastify";
import { chatStoreActions } from "./old/chatStore";
import { ChannelRequestEvent } from "sparks-sdk/channels/ChannelEvent";
import { postMessageOpenToaster } from "@components/Toast";

type Channel = WebRTC | PostMessage | HttpFetch;

interface ChannelStore {
    channels: { [key: ChannelId]: Channel };
    _exports: { [key: ChannelId]: string };
}

export const channelStore = create<ChannelStore>()(
    persist(() => ({
        channels: {},
        _exports: {},
    }), {
        name: 'channels',
        version: 1,
        storage: createJSONStorage(() => indexedDBStorage),
        partialize: (state) => ({
            _exports: state._exports,
        }),
    })
);

export const useChannelStore = createSelectors(channelStore);

export const channelStoreActions = {
    async add(channel: Channel) {
        // if the channel is already in the store, return
        if (channelStore.getState().channels[channel.channelId]) return;

        // update the channel and exports for the first time (or first time this session)
        await channelStoreActions.update(channel);

        // if new listen for changes to the channel and update the store
        channel.on([
            channel.eventTypes.ANY_CONFIRM,
            channel.eventTypes.ANY_REQUEST,
        ], async () => {
            await channelStoreActions.update(channel);
        });
    },
    async import(data: EncryptedData) {
        const user = userStore.getState().user;
        if (!user) throw new Error('User not logged in');
        const decrypted = await user.decrypt({ data }) as any;
        if (!decrypted) throw new Error('Could not decrypt channel data');

        let channel;
        switch (decrypted.type) {
            case 'WebRTC':
                channel = new WebRTC({ spark: user, ...decrypted } as WebRTCParams);
                break;
            case 'PostMessage':
                channel = new PostMessage({ spark: user, ...decrypted } as PostMessageParams);
                break;
            case 'HttpFetch':
                channel = new HttpFetch({ spark: user, ...decrypted } as HttpFetchParams);
                break;
            default:
                throw new Error('Unknown channel type');
        }

        return channelStoreActions.add(channel);
    },
    async update(channel: Channel) {
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
    async remove(channel: Channel) {
        const user = userStore.getState().user;
        if (!user) throw new Error('User not logged in');
        const data = channel.export();
        const encrypted = await user.encrypt({ data });
        if (!encrypted) throw new Error('Could not encrypt channel data');
        const { [channel.channelId]: _, ...channels } = channelStore.getState().channels;
        const { [channel.channelId]: __, ..._exports } = channelStore.getState()._exports;
        _.removeAllListeners();
        channelStore.setState({ channels, _exports });
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
            }
    
            webRTCOpenToaster({
                event: event as ChannelRequestEvent,
                resolve: addAndResolve,
            });
        }, { spark: user });

        unSubUser();
    });
});