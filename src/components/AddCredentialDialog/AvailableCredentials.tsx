import { credentialStoreActions, useCredentialStore } from "@stores/credentialStore";
import { modalActions } from "@stores/modalStore";
import { Button, Card, H3, P } from "sparks-ui";
import { AttestEthereum } from "./AttestEthereum";

const credMap = {
    'ethereum': AttestEthereum
} as any;

export const AvailableCredentials = () => {
    const available = useCredentialStore.use.available();
    const attesting = useCredentialStore.use.attesting();
    const CurrentFlow = attesting ? credMap[attesting] : null;

    return !!attesting ? (
        <CurrentFlow />
    ):(
        <div className="w-full max-w-lg">
            <H3 className="text-center mb-4">Add Credential</H3>
            <P className="text-sm mb-2">Choose from available credentials</P>
            {available.map((credential) => (
                <Card
                    key={credential.id}
                    className="p-2 mb-4 cursor-pointer"
                    shade="light"
                    onClick={() => credentialStoreActions.startFlow(credential.id)}
                >
                    <P>{credential.schema.name}</P>
                </Card>
            ))}
            <Button className="w-full" onClick={() => modalActions.closeModal()}>close</Button>
        </div>
    )
}