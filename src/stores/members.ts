import { storage } from './indexedDb';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import { Buffer } from 'buffer';

export type Member = {
  salt: string;
  name: string;
  data: string
}

export interface MemberStore {
  members: Member[];
  getMembers: () => Member[];
  addMember: (member: Member) => void;
  removeMember: (salt: string) => void;
}

export const useMembers = create<MemberStore>()(
  persist((set, get) => ({
    members: [],
    getMembers: () => {
      const members = get().members
      return members.map(({ data, name, salt }) => ({
        data,
        name: Buffer.from(name, 'base64').toString('utf-8'),
        salt,
      }))
    },
    addMember: (member: Member) => {  
      // allow only one identity for now
      if (get().members.length > 0) return;
      set({ members: [...get().members, member] })
    },
    removeMember: (salt: string) => {
      set({ members: get().members.filter(m => m.salt !== salt) })
    }
  }), {
    name: 'members',
    version: 3,
    storage: createJSONStorage(() => storage),
  })
);