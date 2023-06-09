import { CastingAgent, Password, Blake3, Ed25519, X25519SalsaPoly, PostMessage } from "sparks-sdk";
import { avatar } from "./avatar";

const User = (Base: any) => class User extends Base {
  avatar: string = avatar
  name: string = ''
  constructor({ name, ...args }: { name: string }) {
    super(args);
    this.name = name;
  }
}

User.type = 'agent'

export const Identity = CastingAgent({
  agents: [User],
  sign: Ed25519,
  encrypt: X25519SalsaPoly,
  hash: Blake3,
  derive: Password, 
  channels: [PostMessage],
})
