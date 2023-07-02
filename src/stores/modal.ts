import { ReactNode } from 'react';
import { create } from 'zustand';

export type ModalType = {
  heading: string,
  content: ReactNode,
}

export type IdentityStore = {
  modal: ModalType | null,
  openModal: ({ heading, content } : ModalType) => void,
  closeModal: () => void,
}

export const useModal = create<IdentityStore>((set) => ({
  modal: null,
  openModal: ({ heading, content }: ModalType) => set({ modal: { heading, content } }),
  closeModal: () => set({ modal: null }),
}))
