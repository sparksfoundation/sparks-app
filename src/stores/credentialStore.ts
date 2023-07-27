import { create } from "zustand";

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

async function getAvailable() {
    const path = import.meta.env.SPARKS_ATTESTER
    const response = await fetch(path);
    const ids = await response.json();
    const available = [] as Credential[];

    // get each schema
    await Promise.all(ids.map(async (id: string) => {
        const uri = `${path}/${id}/schema`;
        const response = await fetch(uri);
        const schema = await response.json();
        available.push({ id, schema, uri });
    }));

    return available;
}

export const credentialStore = create<CredentialStore>(() => ({
    available: [],
    attesting: null,
}));

export const useCredentialStore = {
    use: {
        attesting: () => credentialStore(state => {
            return state.attesting;   
        }),
        available: () => credentialStore(state => {
            if (state.available.length === 0) {
                getAvailable()
                    .then((available) => {
                        credentialStore.setState({ available });   
                    });
            }
            return state.available;
        })
    }
}

export const credentialStoreActions = {
    startFlow: (id: string) => {
        credentialStore.setState({ attesting: id });
    },
    stopFlow: () => {
        credentialStore.setState({ attesting: null });
    },
}