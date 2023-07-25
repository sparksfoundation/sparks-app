import { PlusIcon } from "@heroicons/react/20/solid";
import { modalActions } from "@stores/modalStore";
import { Button, Card, H5, P } from "sparks-ui";

export const AddCredentialCard = () => {

    function addCredential() {
        modalActions.openModal({
            title: "Add Credential",
            content: () => (
                <div className="w-full max-w-lg">
                    <P className="text-sm mb-2">Choose from available credentials (in development)</P>
                    <Card className="p-2 mb-4" shade="light"><P>Ethereum</P></Card>
                    <Card className="p-2 mb-4" shade="light"><P>Email</P></Card>
                    <Card className="p-2 mb-4" shade="light"><P>Twitter</P></Card>
                    <Card className="p-2 mb-4" shade="light"><P>YouTube</P></Card>
                    <Card className="p-2 mb-4" shade="light"><P>GitHub</P></Card>
                    <Card className="p-2 mb-4" shade="light"><P>Medium</P></Card>
                    <Button className="w-full" onClick={() => modalActions.closeModal()}>close</Button>
                </div>
            ),
        });
    }

    return (
        <Card
            className="w-full h-full max-w-md p-6 cursor-pointer"
            onClick={addCredential}
        >
            <div className="flex flex-col justify-center items-center h-full">
                <PlusIcon className="h-14 w-14 text-fg-800 dark:text-fg-200" aria-hidden="true" />
                <H5>Add Credential</H5>
            </div>
        </Card>
    )
}