import { Spark, Agent, Password, Blake3, Ed25519, X25519SalsaPoly, PostMessage } from "sparks-sdk";
import { avatar } from "./avatar";

class User extends Agent {
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

export const Identity = new Spark({
  agents: [ User ],
  signer: Ed25519,
  cipher: X25519SalsaPoly,
  hasher: Blake3,
  controller: Password, 
  channels: [PostMessage],
}) as Spark & { agents: { user: User }, controller: Password }
