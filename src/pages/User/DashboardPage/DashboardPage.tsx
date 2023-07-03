import { PrivateLayoutHeader } from "@layout";
import { useUser } from "@stores/user";
import { Card } from "sparks-ui";

export const DashboardPage = () => {
  const { user } = useUser(state => ({ user: state.user }));
  return (
    <>
      <PrivateLayoutHeader title="Dashboard" />
      <Card className="w-full h-full">
      </Card>
    </>
  )
}