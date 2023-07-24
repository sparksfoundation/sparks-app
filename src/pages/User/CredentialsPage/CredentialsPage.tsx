import { PrivateLayoutHeader } from "@layout";
import { H3 } from "sparks-ui";
import { AddCredentialCard, CredentialCard } from "@components/CredentialCard";

export const CredentialsPage = () => (
  <>
    <PrivateLayoutHeader>
      <H3 className="text-center grow">Credentials</H3>
    </PrivateLayoutHeader>
    <div className="flex flex-wrap justify-start gap-4">
      <AddCredentialCard />
    </div>
  </>
)