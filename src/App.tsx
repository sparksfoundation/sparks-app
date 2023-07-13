import { NotificationProvider } from "@providers/NotificationProvider";
import { ModalProvider } from "@providers/ModalProvider/ModalProvider";
import { StoresLoader } from "@providers/StoresLoader";
import { ThemeLoader } from "@providers/ThemeLoader";
import { AppRoutes } from "@routes";
import { BrowserRouter } from "react-router-dom";
import { userStore } from "@stores/userStore";
import { themeStore } from "@stores/themeStore";
import { channelStore } from "@stores/channels";

function App() {
  return (
    <>
      <StoresLoader stores={[themeStore, userStore, channelStore]}>
        <ThemeLoader>
          <BrowserRouter>
            <AppRoutes />
            <NotificationProvider />
            <ModalProvider />
          </BrowserRouter>
        </ThemeLoader>
      </StoresLoader>
    </>
  )
}

export default App
