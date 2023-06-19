import { Spark, Agent, Password, Blake3, Ed25519, X25519SalsaPoly } from "sparks-sdk";
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

// export with User added as type
export const Identity = new Spark({
  agents: [ User ],
  signer: Ed25519,
  cipher: X25519SalsaPoly,
  hasher: Blake3,
  controller: Password, 
}) as any; // TODO: fix this, should be able to type Identity as Spark & User
