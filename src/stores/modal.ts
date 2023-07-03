import { create } from 'zustand';

export type ModalType = {
  title: string,
  content: any,
}

export type ModalStore = {
  modal: ModalType | null,
  openModal: ({ title, content } : ModalType) => void,
  closeModal: () => void,
}

export const useModal = create<ModalStore>((set) => ({
  modal: null,
  openModal: ({ title, content }: ModalType) => set({ modal: { title, content } }),
  closeModal: () => set({ modal: null }),
}))
