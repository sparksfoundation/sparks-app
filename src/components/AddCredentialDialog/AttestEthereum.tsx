import { createSelectors } from "@stores/createSelectors";
import { useCredentialStore } from "@stores/credentialStore";
import { modalActions } from "@stores/modalStore";
import { useUserStore } from "@stores/userStore";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Button, H3, H4, P, Pre } from "sparks-ui";
import { recoverMessageAddress } from "viem";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { create } from "zustand";

type Nullable<T> = T | null;

interface FlowStore {
  challenge: Nullable<string>;
  signature: Nullable<string>;
  credential: Nullable<Record<string, any>>;
  error: Nullable<string>;
}

const flowStore = create<FlowStore>(() => ({
  challenge: null,
  signature: null,
  credential: null,
  error: null,
}));

const useFlowStore = createSelectors(flowStore);

const flowActions = {
  setChallenge: (challenge: string) => flowStore.setState({ challenge }),
  setSignature: (signature: string) => flowStore.setState({ signature }),
  setCredential: (credential: Record<string, any>) => flowStore.setState({ credential }),
  reset: () => flowStore.setState({ 
    challenge: null, 
    signature: null,
    credential: null,
    error: null,
  }),
}


function GetChallenge() {
  const { address } = useAccount();
  const user = useUserStore.use.user();
  const attesting = useCredentialStore.use.attesting();

  async function getChallenge() {
    const path = `${import.meta.env.SPARKS_ATTESTER}/${attesting}/challenge`
    const result = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: user?.identifier,
        publicKey: address
      }),
      credentials: 'include'
    });
    const code = await result.text();
    flowActions.setChallenge(code);
  }

  return (
    <div>
      <H3 className="mb-4 text-center">Get Challenge Code</H3>
      <P className="whitespace-nowrap overflow-hidden text-ellipsis mb-4">Connected: {address}</P>
      <P className="mb-4">Click "Get Code" to get a challenge code to sign with your account.</P>
      <div className="flex gap-4">
        <Button className="w-full" color="warning" onClick={() => modalActions.closeModal()}>Cancel</Button>
        <Button className="w-full" onClick={getChallenge}>Get Code</Button>
      </div>
    </div>
  )
}

function ConnectWallet() {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  return (
    <div>
      <H3 className="mb-4 text-center">Connect Wallet</H3>
      <P className="mb-4">Connect your wallet to start attestation flow</P>
      <Button className="w-full" onClick={() => connect()}>Connect Wallet</Button>
    </div>
  )
}

function SignChallenge() {
  const { address } = useAccount();
  const challenge = useFlowStore.use.challenge();
  const { data, signMessage, variables } = useSignMessage();

  useEffect(() => {
    ; (async () => {
      if (variables?.message && data) {
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: data,
        })

        if (address === recoveredAddress) {
          flowActions.setSignature(data);
        }
      }
    })()
  })

  async function signCode() {
    if (!challenge) return;
    signMessage({ message: challenge });
  }

  return (
    <div>
      <H3 className="mb-4 text-center">Sign Challenge Code</H3>
      <P className="mb-4">Click "Sign Code" to sign the challenge and submit it for verification.</P>
      <P className="mb-4">Code: {challenge}</P>
      <div className="flex gap-4">
        <Button className="w-full" color="warning" onClick={() => modalActions.closeModal()}>Cancel</Button>
        <Button className="w-full" onClick={signCode}>Sign Message</Button>
      </div>
    </div>
  )
}

function ClaimCredential() {
  const attesting = useCredentialStore.use.attesting();
  const signature = useFlowStore.use.signature();
  const challenge = useFlowStore.use.challenge();
  const credential = useFlowStore.use.credential();

  useEffect(() => {
    ;(async () => {
      if ((!signature || !challenge) || credential) return;        

      const path = `${import.meta.env.SPARKS_ATTESTER}/${attesting}/claim`
      const result = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signature }),
        credentials: 'include'
      });

      const cred = await result.json();
      setTimeout(() => {
        flowActions.setCredential(cred);
      }, 1000)
    })()
  })

  if (credential) return <></>

  return (
    <div>
      <H3 className="mb-4 text-center">Claiming Credential</H3>
      <P className="text-center">... Please wait</P>
    </div>
  )
}

export function AttestEthereum() {
  const { isConnected } = useAccount()
  const challenge = useFlowStore.use.challenge();
  const signature = useFlowStore.use.signature();
  const error = useFlowStore.use.error();
  const credential = useFlowStore.use.credential();

  useEffect(() => {
    if (credential) {
      //flowActions.reset();
      //modalActions.closeModal();
      //toast.success("Credential added");
    }
  }, [credential])

  if (!!error) return <div>{error}</div>;

  if (!isConnected) return <ConnectWallet />;

  if (!challenge) return <GetChallenge />;

  if (!signature) return <SignChallenge />;

  if (credential) return (
    <div>
      <H3 className="mb-4 text-center">Credential Claimed!</H3>
      <Pre className="overflow-hidden">{JSON.stringify(credential, null, 2)}</Pre>
    </div>
  )

  return <ClaimCredential />;
}