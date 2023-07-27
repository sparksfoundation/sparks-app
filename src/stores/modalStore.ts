import { create } from 'zustand';
import { createSelectors } from './createSelectors';

type Nullable<T> = T | null;

interface ModalStore {
  open: boolean,
  title?: Nullable<string>,
  content: Nullable<any>,
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto',
}

export const modalStore = create<ModalStore>(() => ({
  open: false,
  title: null,
  content: null,
  size: 'md',
}));

export const useModalStore = createSelectors(modalStore);

export const modalActions = {
  openModal: ({ title, content, size = 'md' }: { title?: string, content: any, size?: ModalStore['size'] }) => {
    modalStore.setState({ 
      title, 
      content, 
      size,
      open: true 
    })
  },
  closeModal: () => {
    modalStore.setState({ 
      title: null, 
      content: null, 
      size: 'md',
      open: false 
    })
  },
}
