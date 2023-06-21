import { useRoutes } from "react-router-dom";
import { useMembers } from "@stores/members";
import { useTheme } from "@stores/theme";
import { LoadStores } from "./LoadStorage";
import { LoadTheme } from "./LoadTheme";
import { Forward } from "./Forward";
import { PublicLayout, PrivateLayout } from "@layout";

import { Landing } from "@views";
import { Create, Import, Unlock } from "@views/auth";
import { Dashboard } from "@views/user";
import { Credentials } from "@views/user/credentials";
import { Settings } from "@views/user/settings";
import { SandBox } from "@views/user/SandBox/SandBox";

import {
  AUTH_CREATE_PATH,
  AUTH_UNLOCK_PATH,
  AUTH_IMPORT_PATH,
  USER_PATH,
  USER_CREDENTIALS_PATH,
  USER_SANDBOX_PATH,
  USER_SETTINGS_PATH,
} from "@utils/routeHelpers";

const routes = [
  {
    element: <LoadStores stores={[useTheme, useMembers]} />,
    children: [
      {
        element: <LoadTheme />,
        children: [
          {
            element: <PublicLayout />,
            children: [
              {
                path: "",
                element: (
                  <Forward
                    Component={Landing}
                    usersTo={USER_PATH}
                    membersTo={AUTH_UNLOCK_PATH}
                  />
                ),
              },
              {
                path: AUTH_CREATE_PATH,
                element: (
                  <Forward Component={Create} membersTo={AUTH_UNLOCK_PATH} />
                ),
              },
              {
                path: AUTH_UNLOCK_PATH,
                element: (
                  <Forward
                    Component={Unlock}
                    usersTo={USER_PATH}
                    guestsTo={AUTH_CREATE_PATH}
                  />
                ),
              },
              {
                path: AUTH_IMPORT_PATH,
                element: <Forward Component={Import} usersTo={USER_PATH} />,
              },
            ],
          },
          {
            element: <PrivateLayout />,
            children: [
              {
                path: USER_PATH,
                element: (
                  <Forward
                    Component={Dashboard}
                    guestsTo={AUTH_CREATE_PATH}
                    membersTo={AUTH_UNLOCK_PATH}
                  />
                ),
              },
              {
                path: USER_PATH,
                element: (
                  <Forward
                    Component={Dashboard}
                    guestsTo={AUTH_CREATE_PATH}
                    membersTo={AUTH_UNLOCK_PATH}
                  />
                ),
              },
              {
                path: USER_CREDENTIALS_PATH,
                element: (
                  <Forward
                    Component={Credentials}
                    guestsTo={AUTH_CREATE_PATH}
                    membersTo={AUTH_UNLOCK_PATH}
                  />
                ),
              },
              {
                path: USER_SANDBOX_PATH,
                element: (
                  <Forward
                    Component={() => <SandBox />}
                    guestsTo={AUTH_CREATE_PATH}
                    membersTo={AUTH_UNLOCK_PATH}
                  />
                ),
              },
              {
                path: USER_SETTINGS_PATH,
                element: (
                  <Forward
                    Component={Settings}
                    guestsTo={AUTH_CREATE_PATH}
                    membersTo={AUTH_UNLOCK_PATH}
                  />
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];

export const AppRoutes = () => {
  const element = useRoutes(routes);
  return <>{element}</>;
};
