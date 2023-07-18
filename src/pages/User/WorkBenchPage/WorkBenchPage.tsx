import { PrivateLayoutHeader } from "@layout";
import { Card, H3, H6 } from "sparks-ui";

export const WorkBenchPage = () => (
  <>
    <PrivateLayoutHeader>
      <H3 className="text-center grow">Work Bench</H3>
    </PrivateLayoutHeader>
    <div className="flex gap-2 w-full items-stretch">
      <Card className="w-full">
        <H6 className="text-center">Watch Key Events</H6>
      </Card>
      <Card className="w-full">
        <H6 className="text-center">Provide Storage</H6>
      </Card>
      <Card className="w-full">
        <H6 className="text-center">Relay Peers</H6>
      </Card>
    </div>
  </>
)