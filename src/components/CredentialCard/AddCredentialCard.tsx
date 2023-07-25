import { AvailableCredentials } from "@components/AddCredentialDialog";
import { PlusIcon } from "@heroicons/react/20/solid";
import { modalActions } from "@stores/modalStore";
import { Card, H5 } from "sparks-ui";

export const AddCredentialCard = () => {
    function addCredential() {
        modalActions.openModal({
            content: AvailableCredentials
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