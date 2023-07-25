import { create } from 'zustand';
import { createSelectors } from './createSelectors';

type Nullable<T> = T | null;

interface ModalStore {
  open: boolean,
  title?: Nullable<string>,
  content: Nullable<any>,
}

export const modalStore = create<ModalStore>(() => ({
  open: false,
  title: null,
  content: null,
}));

export const useModalStore = createSelectors(modalStore);

export const modalActions = {
  openModal: ({ title, content }: { title?: string, content: any }) => {
    modalStore.setState({ 
      title, 
      content, 
      open: true 
    })
  },
  closeModal: () => {
    modalStore.setState({ 
      title: null, 
      content: null, 
      open: false 
    })
  },
}
