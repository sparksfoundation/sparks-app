import { PrivateLayoutHeader } from "@layout";
import { Card, H3, H6 } from "sparks-ui";

export const WorkBenchPage = () => (
  <>
    <PrivateLayoutHeader>
      <H3 className="text-center grow">Settings</H3>
    </PrivateLayoutHeader>
    <div className="flex gap-2 w-full items-stretch">
      <Card className="w-full">
        <H6 className="text-center">Watch Events</H6>
      </Card>
      <Card className="w-full">
        <H6 className="text-center">Store Receipts</H6>
      </Card>
      <Card className="w-full">
        <H6 className="text-center">Provide Relay</H6>
      </Card>
    </div>
  </>
)