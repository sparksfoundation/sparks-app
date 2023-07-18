import { PrivateLayoutHeader } from "@layout";
import { Card, H3 } from "sparks-ui";

export const DashboardPage = () => {
  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Dashboard</H3>
      </PrivateLayoutHeader>
      <Card className="w-full h-full">
      </Card>
    </>
  )
}