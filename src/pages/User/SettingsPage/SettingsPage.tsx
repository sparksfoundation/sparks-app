import { PrivateLayoutHeader } from "@layout"
import { Card, H3 } from "sparks-ui"

export const SettingsPage = () => {
  return (
    <Card className="w-full h-full">
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Settings</H3>
      </PrivateLayoutHeader>
    </Card>
  )
}