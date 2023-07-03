// STORES
interface UserStore {
  user: any,
}

interface UserActions {
  login: (user: any) => void,
  logout: () => void,
}

interface ChannelStore {
  channels: any[],
}

interface ChannelActions {
  addChannel: (channel: any) => void,
  delChannel: (channel: any) => void,
}

interface ModalStore {
  title: string,
  content: string,
  open: boolean,
}

interface ModalActions {
  openModal: (title: string, content: string) => void,
  closeModal: () => void,
}

interface ThemeStore {
  theme: string,
}

interface ThemeActions {
  setTheme: (theme: string) => void,
  toggleTheme: () => void,
}


const encryptMiddleware = (setUserState: (state: UserState) => void) => (config: any) => (
  set: any,
  get: any,
  api: any
) => {
  const getUserState = () => useUserStore.getState();

  return config((args: any) => {
    const userState = getUserState();
    if (userState.isLoggedIn) {
      const encryptedData = encrypt(args, userState.userId);
      api.setState({ data: encryptedData });
    } else {
      // Handle case when user is not logged in
    }
  }, get, api);
};
