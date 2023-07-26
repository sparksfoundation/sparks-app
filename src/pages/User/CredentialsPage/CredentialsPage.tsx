import { PrivateLayoutHeader } from "@layout";
import { H3 } from "sparks-ui";
import { AddCredentialCard, CredentialCard } from "@components/CredentialCard";
import { useUserStore } from "@stores/userStore";

export const CredentialsPage = () => {
  const user = useUserStore.use.user();
  const _ = useUserStore.use._data(); // update when data saved
  const creds = user?.agents?.presenter?.credentials;

  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Credentials</H3>
      </PrivateLayoutHeader>
      <div className="flex flex-wrap justify-start gap-4">
        {creds && creds.map((cred, index) => (
          <CredentialCard key={cred.issuanceDate + index} credential={cred} />
        ))}
        <AddCredentialCard />
      </div>
    </>
  )
}