import { storage } from './indexedDb';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

export type Member = {
  salt: string;
  name: string;
  data: string
}

export interface MemberStore {
  members: Member[];
  getMembers: (state: MemberStore) => Member[];
  addMember: (member: Member) => void;
  removeMember: (salt: string) => void;
}

export const useMembers = create<MemberStore>()(
  persist((set, get) => ({
    members: [],
    getMembers: () => get().members,
    addMember: (member: Member) => {  
      set({ members: [...get().members, member] })
    },
    removeMember: (salt: string) => {
      set({ members: get().members.filter(m => m.salt !== salt) })
    }
  }), {
    name: 'members',
    version: 1,
    storage: createJSONStorage(() => storage),
  })
);