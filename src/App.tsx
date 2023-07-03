import { NotificationProvider } from "@providers/NotificationProvider";
import { ModalProvider } from "@providers/ModalProvider/ModalProvider";
import { StoresLoader } from "@providers/StoresLoader";
import { ThemeLoader } from "@providers/ThemeLoader";
import { AppRoutes } from "@routes";
import { useMembers } from "@stores/members";
import { useTheme } from "@stores/theme";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <StoresLoader stores={[useTheme, useMembers]}>
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
