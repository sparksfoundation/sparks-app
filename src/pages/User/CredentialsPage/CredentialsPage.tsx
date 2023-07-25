import { PrivateLayoutHeader } from "@layout";
import { H3 } from "sparks-ui";
import { AddCredentialCard } from "@components/CredentialCard";

export const CredentialsPage = () => {
  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Credentials</H3>
      </PrivateLayoutHeader>
      <div className="flex flex-wrap justify-start gap-4">
        <AddCredentialCard />
      </div>
    </>
  )
}