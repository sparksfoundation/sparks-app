import { CoreAgent } from "sparks-sdk/agents";
import { Ed25519Password } from "sparks-sdk/signers";
import { X25519SalsaPolyPassword } from "sparks-sdk/ciphers";
import { Blake3 } from "sparks-sdk/hashers";
import { create } from 'zustand';
import { avatar } from "@assets/avatar";
import { Basic } from "sparks-sdk/controllers";
import { Spark } from "node_modules/sparks-sdk/dist/Spark";
import { FetchAPI, PostMessage, WebRTC } from "sparks-sdk/channels";
import { useMembers } from "./members";

Spark.availableChannels = [PostMessage, WebRTC, FetchAPI];

class Profile extends CoreAgent {
  public _avatar: string = avatar
  public _name: string = ''

  get name() {
    return this._name
  }

  set name(name) {
    this._name = name
  }

  get avatar() {
    return this._avatar
  }

  set avatar(avatar) {
    this._avatar = avatar
  }

  public async import(data: Record<string, any>): Promise<void> {
    this._avatar = data.avatar
    this._name = data.name
    return Promise.resolve();
  }

  public async export(): Promise<Record<string, any>> {
    return Promise.resolve({
      avatar: this._avatar,
      name: this._name,
    });
  }
}

export type User = Spark<[Profile], X25519SalsaPolyPassword, Basic, Blake3, Ed25519Password>;

function emptyUser(): User {
  return new Spark({
    agents: [Profile],
    signer: Ed25519Password,
    cipher: X25519SalsaPolyPassword,
    hasher: Blake3,
    controller: Basic,
  });
}

export type IdentityStore = {
  user: User,
  login: (user: User) => void
  logout: () => void
}

export const useUser = create<IdentityStore>((set) => ({
  user: emptyUser(),
  login: (user) => {
    set({ user: user })
  },
  logout: () => {
    set({ user: emptyUser() })
  },
}));

if (window) {
  window.addEventListener('beforeunload', async () => {
    const { user } = useUser.getState()
    if (user.identifier && user.keyPairs.cipher.salt) {
      const salt = user.keyPairs.cipher.salt
      const data = await user.export()
      useMembers.getState().updateMember({
        name: user.agents.profile.name,
        salt,
        data,
      })
    } 
  }, { capture: true });
}

