import { Agent } from "sparks-sdk/agents";
import { Ed25519 } from "sparks-sdk/signers";
import { X25519SalsaPoly } from "sparks-sdk/ciphers";
import { Blake3 } from "sparks-sdk/hashers";
import { Password } from "sparks-sdk/controllers";
import { create } from 'zustand';
import { avatar } from "@assets/avatar";
import { Spark } from "sparks-sdk";

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

export type User = Spark<Password, Ed25519,X25519SalsaPoly,Blake3, [ Profile ]>;

export const user: User = new Spark({
  agents: [ Profile ],
  signer: Ed25519,
  cipher: X25519SalsaPoly,
  hasher: Blake3,
  controller: Password, 
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
