import { Card, H5, NoiseBackground } from "sparks-ui";
import { CredentialCardMenu } from "./CredentialMenu";

export const CredentialCard = ({
  credential
}: {
  credential: Record<string, any>
}) => {

  return (
    <Card className="w-full h-full max-w-sm p-0">
      <header className="relative h-auto p-4">
        <NoiseBackground shade="light" />
        <div className="relative justify-between flex">
          <H5>{credential.type[credential.type.length - 1]}</H5>
          <CredentialCardMenu credential={credential} />
        </div>
      </header>
    </Card>
  )
}