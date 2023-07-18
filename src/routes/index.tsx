import { Location, Navigate, NavigateFunction, NavigateProps, generatePath, useLocation, useNavigate, useParams, useRoutes, useSearchParams } from "react-router-dom";
import { Forward } from "./Forward";
import { PublicLayout, PrivateLayout } from "@layout";

import { LandingPage } from "@pages/LandingPage";
import { CreatePage } from "@pages/Auth/CreatePage";
import { UnlockPage } from "@pages/Auth/UnlockPage";
import { DashboardPage } from "@pages/User/DashboardPage";
import { CredentialsPage } from "@pages/User/CredentialsPage";
import { AppsPage } from "@pages/User/AppsPage";
import { WorkBenchPage } from "@pages/User/WorkBenchPage";
import { MessengerPage } from "@pages/User/MessengerPage";

import { Settings } from "@views/user/settings";
import { SandBox } from "@views/user/SandBox/SandBox";
import { Paths } from "./paths";

interface Props extends NavigateProps {
  to: string;
}
const NavigateWithParams: React.FC<Props> = ({ to, ...props }) => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const search = Object.fromEntries(searchParams.entries());
  const state = useLocation().state || {};
  Object.keys(search).forEach(key => {
    try { search[key] = JSON.parse(search[key]) } catch (error) {}
  });
  return <Navigate {...props} to={generatePath(to, params)} state={{ ...state, search: search || null }}  />;
};

const routes = [
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
      { path: Paths.USER_MESSENGER, element: <Forward Component={MessengerPage} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
      { path: Paths.USER_APPS, element: <Forward Component={AppsPage} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
      { path: `${Paths.APP_LOGIN}`, element: <NavigateWithParams to={`${Paths.USER_APPS}/single-signon`} /> },
      { path: `${Paths.USER_APPS}/:appName`, element: <Forward Component={AppsPage} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
      { path: Paths.USER_WORKBENCH, element: <Forward Component={WorkBenchPage} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
      { path: Paths.USER_SANDBOX, element: <Forward Component={() => <SandBox />} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
      { path: Paths.USER_SETTINGS, element: <Forward Component={Settings} guestsTo={Paths.AUTH_CREATE} membersTo={Paths.AUTH_UNLOCK} /> },
    ]
  }
]

export const AppRoutes = () => {
  const element = useRoutes(routes);
  history.navigate = useNavigate();
  history.location = useLocation();
  return <>{element}</>;
};

export const history = {} as {
  navigate: NavigateFunction,
  location: Location,
}