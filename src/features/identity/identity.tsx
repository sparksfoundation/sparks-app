import { Agent, Password, Blake3, Ed25519, X25519SalsaPoly, PostMessage } from "sparks-sdk";
import { avatar } from "./avatar";

const User = (Base: any) => class User extends Base {
  avatar: string = avatar
  name: string = ''

  constructor({ name, ...args }: { name: string }) {
    super(args);
    this.name = name;
  }
}

export const Identity = Agent(Password, Blake3, Ed25519, X25519SalsaPoly, PostMessage, User)
