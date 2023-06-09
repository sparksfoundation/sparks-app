import { useMembers } from "@stores/members";
import { useUser } from "@stores/user";
import { Navigate, matchPath, useLocation, useSearchParams } from "react-router-dom";

export type ForwardProps = {
  usersTo?: string;
  membersTo?: string;
  guestsTo?: string;
  Component: React.FC;
};

export const Forward = ({ usersTo, membersTo, guestsTo, Component }: ForwardProps) => {
  const user = useUser(state => state.user)
  const members = useMembers(state => state.members)
  const location = useLocation()
  const params = Object.fromEntries(useSearchParams()[0].entries())

  const isUser = !!user
  const isMember = !user && members.length > 0
  const isGuest = !user && members.length === 0

  const redirectUser = usersTo && isUser && !matchPath(usersTo, location.pathname)
  const redirectMember = membersTo && isMember && !matchPath(membersTo, location.pathname)
  const redirectGuest = guestsTo && isGuest && !matchPath(guestsTo, location.pathname)

  if (redirectUser) {
    const prevPath = location?.state?.prev?.pathname
    const prevState = location?.state || {}
    const userPath = prevPath || usersTo
    return <Navigate to={userPath} state={prevState} />
  }

  if (redirectMember) {
    return <Navigate to={membersTo} state={{ prev: { pathname: location.pathname, params } }} />
  }

  if (redirectGuest) {
    return <Navigate to={guestsTo} state={{ prev: { pathname: location.pathname, params } }} />
  }
  
  return <Component />
}
