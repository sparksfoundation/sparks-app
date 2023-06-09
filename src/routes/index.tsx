import { useRoutes } from 'react-router-dom';
import { useMembers } from '@stores/members';
import { useTheme } from '@stores/theme';
import { LoadStores } from './LoadStorage';
import { LoadTheme } from './LoadTheme';
import { Forward } from './Forward';
import { PublicLayout, PrivateLayout } from '@layout';

import { Landing } from '@views';
import { Create, Import, Unlock } from '@views/auth';
import { Apps, Dashboard } from '@views/user';
import { Worker } from '@views/user/worker';

const routes = [
  {
    element: <LoadStores stores={[useTheme, useMembers]} />,
    children: [
      {
        element: <LoadTheme />,
        children: [
          {
            element: <PublicLayout />, children: [
              { path: '', element: <Forward Component={Landing} usersTo="/user" membersTo="/auth/unlock" /> },
              { path: '/auth/create', element: <Forward Component={Create} membersTo="/auth/unlock" /> },
              { path: '/auth/unlock', element: <Forward Component={Unlock} usersTo="/user" guestsTo="/auth/create" /> },
              { path: '/auth/import', element: <Forward Component={Import} usersTo="/user" /> },
            ]
          },
          {
            element: <PrivateLayout />, children: [
              { path: '/user', element: <Forward Component={Dashboard} guestsTo='/auth/create' membersTo='/auth/unlock' /> },
              { path: '/user/apps', element: <Forward Component={Apps} guestsTo='/auth/create' membersTo='/auth/unlock' /> },
              { path: '/user/apps/:id', element: <Forward Component={Landing} guestsTo='/auth/create' membersTo='/auth/unlock' /> },
              { path: '/user/worker', element: <Forward Component={() => <Worker />} guestsTo='/auth/create' membersTo='/auth/unlock' /> },
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

