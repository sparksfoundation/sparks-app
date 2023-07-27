import { NotificationProvider } from "@providers/NotificationProvider";
import { ModalProvider } from "@providers/ModalProvider/ModalProvider";
import { StoresLoader } from "@providers/StoresLoader";
import { ThemeLoader } from "@providers/ThemeLoader";
import { AppRoutes } from "@routes";
import { BrowserRouter } from "react-router-dom";
import { userStore } from "@stores/userStore";
import { themeStore } from "@stores/themeStore";
import { channelStore } from "@stores/channels";

import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { createPublicClient, http } from 'viem'

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http()
  }),
})

function App() {
  return (
    <>
      <StoresLoader stores={[themeStore, userStore, channelStore]}>
        <ThemeLoader>
          <WagmiConfig config={config}>
            <BrowserRouter>
              <AppRoutes />
              <NotificationProvider />
              <ModalProvider />
            </BrowserRouter>
          </WagmiConfig>
        </ThemeLoader>
      </StoresLoader>
    </>
  )
}

export default App
