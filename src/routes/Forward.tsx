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
  const { user } = useUser(state => ({ user: state.user }))
  const members = useMembers(state => state.members)
  const location = useLocation()
  const params = Object.fromEntries(useSearchParams()[0].entries())

  const isUser = !!user && user.identifier
  const isMember = !isUser && members.length > 0
  const isGuest = !isMember && members.length === 0

  const redirectUser = usersTo && isUser && !matchPath(usersTo, location.pathname)
  const redirectMember = membersTo && isMember && !matchPath(membersTo, location.pathname)
  const redirectGuest = guestsTo && isGuest && !matchPath(guestsTo, location.pathname)

  let state = location.state || {}
  if (location.pathname.startsWith('/user/sandbox')) {
    state = { prev: { pathname: location.pathname, params } }
  }
  
  if (redirectUser) {
    const userPath = state?.prev?.pathname || usersTo
    return <Navigate to={userPath} state={state} />
  } else if (redirectMember) {
    return <Navigate to={membersTo} state={state} />
  } else if (redirectGuest) {
    return <Navigate to={guestsTo} state={state} />
  }
  
  return <Component />
}
