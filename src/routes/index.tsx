import { useRoutes } from 'react-router-dom';
import { useMembers } from '@stores/members';
import { useTheme } from '@stores/theme';
import { LoadStores } from './LoadStorage';
import { LoadTheme } from './LoadTheme';
import { Forward } from './Forward';
import { PublicLayout, PrivateLayout } from '@layout';

import { Landing } from '@views';
import { Create, Import, Unlock } from '@views/auth';
import { Dashboard } from '@views/user';
import { Settings } from '@views/user/settings';
import { SandBox } from '@views/user/SandBox/SandBox';
import { Paths } from '@routes/paths';

const routes = [
  {
    element: <LoadStores stores={[useTheme, useMembers]} />,
    children: [
      {
        element: <LoadTheme />,
        children: [
          {
            element: <PublicLayout />, children: [
              { path: Paths.HOME, element: <Forward Component={Landing} usersTo={Paths.USER} membersTo={Paths.AUTH_UNLOCK} /> },
              { path: Paths.AUTH_CREATE, element: <Forward Component={Create} membersTo={Paths.AUTH_UNLOCK} /> },
              { path: Paths.AUTH_UNLOCK, element: <Forward Component={Unlock} usersTo={Paths.USER} guestsTo={Paths.AUTH_CREATE} /> },
              { path: Paths.AUTH_IMPORT, element: <Forward Component={Import} usersTo={Paths.USER} /> },
            ]
          },
          {
            element: <PrivateLayout />, children: [
              { path: Paths.USER, element: <Forward Component={Dashboard} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
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

