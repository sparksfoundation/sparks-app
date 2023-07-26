import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';
import { indexedDBStorage } from "./IndexedDB";
import { Spark } from "sparks-sdk";
import { Profile } from "sparks-sdk/agents/Profile";
import { Presenter } from "sparks-sdk/agents/Presenter";
import { avatar } from "@assets/avatar";
import { X25519SalsaPolyPassword } from "sparks-sdk/ciphers/X25519SalsaPolyPassword";
import { Basic } from "sparks-sdk/controllers/Basic";
import { Blake3 } from "sparks-sdk/hashers/Blake3";
import { Ed25519Password } from "sparks-sdk/signers/Ed25519Password";
import { Buffer } from "buffer";
import { createSelectors } from "./createSelectors";

export type User = Spark<[Profile, Presenter], X25519SalsaPolyPassword, Basic, Blake3, Ed25519Password>;

function sparkInstance(): User & {
  agents: {
    profile: Profile,
    presenter: Presenter,
  }
} {
  return new Spark({
    agents: [Profile, Presenter],
    signer: Ed25519Password,
    cipher: X25519SalsaPolyPassword,
    hasher: Blake3,
    controller: Basic,
  }) as User & {
    agents: {
      profile: Profile,
      presenter: Presenter,
    }
  };
}

type Nullable<T> = T | null;

interface UserStore {
  user: Nullable<User & {
    agents: {
      profile: Profile,
      presenter: Presenter,
    }
  }>,// the user instance
  _data: Nullable<string>,          // encrypted data 
  _handle: Nullable<string>,        // the user name
  _salts: Nullable<{
    cipher: string,                 // the salt used to derive the cipher key
    signer: string,                 // the salt used to derive the signer key
  }>,
  account: () => Nullable<string>,  // get the handle of the local account
}

export const userStore = create<UserStore>()(
  persist((_, get) => ({
    user: null,
    _data: null,
    _handle: null,
    _salts: null,
    account: () => {
      const { _data, _handle, _salts } = get();
      if (!_data || !_handle || !_salts) return null;
      return Buffer.from(_handle || '', 'base64').toString();
    },
  }), {
    name: 'user',
    version: 2,
    storage: createJSONStorage(() => indexedDBStorage),
    partialize: (state) => ({
      _data: state._data,
      _handle: state._handle,
      _salts: state._salts,
    }),
  })
);

export const useUserStore = createSelectors(userStore);

export const userActions = {
  login: async ({ password }: { password: string }) => {
    const user = sparkInstance();
    const { _data, _salts } = userStore.getState();

    if (!_data || !_salts) {
      throw new Error('No user data found');
    }

    await user.import({
      data: _data,
      cipher: { password, salt: _salts.cipher },
      signer: { password, salt: _salts.signer },
    });

    return userStore.setState({ user: user })
  },
  create: async ({ handle, password }: { handle: string, password: string }) => {
    const user = sparkInstance();

    await user.incept({ password });

    user.agents.profile.handle = handle;
    user.agents.profile.avatar = avatar;

    const salts = {
      cipher: user.keyPairs.cipher.salt,
      signer: user.keyPairs.signer.salt,
    };

    const data = await user.export();
    const _handle = Buffer.from(handle).toString('base64');

    return userStore.setState({ user: user, _data: data, _handle, _salts: salts })
  },
  save: async () => {
    const { user, _handle, _salts } = userStore.getState();
    if (!user || !_salts) return; 
    const data = await user.export();
    console.log('aving')
    return userStore.setState({ user: user, _data: data, _handle, _salts })
  },
  logout: () => {
    return userStore.setState({ user: null })
  },
  destroy: async ({ password }: { password: string }) => {
    const { user, _salts, _data } = userStore.getState();

    if (!user || !_salts || !_data) {
      throw new Error('No user data found');
    }

    const cipher = await user.cipher.generateKeyPair({ password, salt: _salts.cipher });
    const signer = await user.signer.generateKeyPair({ password, salt: _salts.signer });
    const cipherMatch = user.publicKeys.cipher === cipher.publicKey;
    const signerMatch = user.publicKeys.signer === signer.publicKey;

    if (!cipherMatch || !signerMatch) {
      throw new Error('Invalid password');
    }

    userStore.setState({
      user: null,
      _data: null,
      _handle: null,
      _salts: null,
    })
  },
}

