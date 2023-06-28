import { Agent } from "sparks-sdk/agents";
import { Ed25519Password } from "sparks-sdk/signers";
import { X25519SalsaPolyPassword } from "sparks-sdk/ciphers";
import { Blake3 } from "sparks-sdk/hashers";
import { create } from 'zustand';
import { avatar } from "@assets/avatar";
import { Basic } from "sparks-sdk/controllers";
import { Spark } from "sparks-sdk";
import { SparkInterface } from "node_modules/sparks-sdk/dist/types";

class Profile extends Agent {
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
}

export type User = SparkInterface<[ Agent ], X25519SalsaPolyPassword, Basic, Blake3, Ed25519Password>;

export const user: User = new Spark({
  agents: [ Profile ],
  signer: Ed25519Password,
  cipher: X25519SalsaPolyPassword,
  hasher: Blake3,
  controller: Basic, 
});

export type IdentityStore = {
  user: User,
  login: (user: User) => void
  logout: () => void
}

export const useUser = create<IdentityStore>((set) => ({
  user: user,
  login: (user) => set({ user: user }),
  logout: () => set({ user: undefined }),
}))
