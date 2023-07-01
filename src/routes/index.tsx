import { useRoutes } from "react-router-dom";
import { useMembers } from "@stores/members";
import { useTheme } from "@stores/theme";
import { LoadStores } from "./LoadStores";
import { LoadTheme } from "./LoadTheme";
import { Forward } from "./Forward";
import { PublicLayout, PrivateLayout } from "@layout";

import { LandingPage } from "@pages/LandingPage";
import { CreatePage } from "@pages/Auth/CreatePage";
import { UnlockPage } from "@pages/Auth/UnlockPage";
import { DashboardPage } from "@pages/User/DashboardPage";
import { CredentialsPage } from "@pages/User/CredentialsPage";

import { Settings } from "@views/user/settings";
import { SandBox } from "@views/user/SandBox/SandBox";
import { Paths } from "./paths";

const routes = [
  {
    element: <LoadStores stores={[useTheme, useMembers]} />,
    children: [
      {
        element: <LoadTheme />,
        children: [
          {
            element: <PublicLayout />, children: [
              { path: Paths.HOME, element: <Forward Component={LandingPage} usersTo={Paths.USER} membersTo={Paths.AUTH_UNLOCK} /> },
              { path: Paths.AUTH_CREATE, element: <Forward Component={CreatePage} membersTo={Paths.AUTH_UNLOCK} /> },
              { path: Paths.AUTH_UNLOCK, element: <Forward Component={UnlockPage} usersTo={Paths.USER} guestsTo={Paths.AUTH_CREATE} /> },
            ]
          },
          {
            element: <PrivateLayout />, children: [
              { path: Paths.USER, element: <Forward Component={DashboardPage} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
              { path: Paths.USER_CREDENTIALS, element: <Forward Component={CredentialsPage} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
              { path: Paths.USER_SETTINGS, element: <Forward Component={Settings} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
              { path: Paths.USER_SANDBOX, element: <Forward Component={() => <SandBox />} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
            ]
          }
        ]
      }
    ]
  }
]

export const AppRoutes = () => {
  const element = useRoutes(routes);
  return <>{element}</>;
};
