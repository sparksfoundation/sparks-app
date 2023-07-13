import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { themeStore } from "@stores/themeStore";

export const NotificationProvider = () => {
  const theme = themeStore(state => state.theme);

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={50000000}
      hideProgressBar={false}
      closeOnClick={true}
      pauseOnHover={true}
      draggable={true}
      theme={theme}
    />
  )
}