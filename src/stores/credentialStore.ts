import { create } from "zustand";
import { createSelectors } from "./createSelectors";

type Nullable<T> = T | null;

interface Credential {
    id: string;
    schema: Record<string, any>;
    uri: string;
}

interface CredentialStore {
    available: Credential[];
    attesting: Nullable<string>;
}

export const credentialStore = create<CredentialStore>(() => ({
    available: [],
    attesting: null,
}));

export const useCredentialStore = createSelectors(credentialStore);

export const credentialStoreActions = {
    initialize: async () => {
        const path = import.meta.env.SPARKS_ATTESTER
        const response = await fetch(path);
        const ids = await response.json();
        const available = [] as Credential[];

        // get each schema
        await Promise.all(ids.map(async (id: string) => {
            const uri = `${path}/${id}/schema`;
            const response = await fetch(uri);
            const schema = await response.json();
            available.push({ id, schema, uri});
        }));

        credentialStore.setState({ available });
    },
    startFlow: (id: string) => {
        credentialStore.setState({ attesting: id });
    },
}

window.addEventListener("load", async () => {
    credentialStoreActions.initialize();
});