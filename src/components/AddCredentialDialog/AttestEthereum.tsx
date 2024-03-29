import { createSelectors } from "@stores/createSelectors";
import { credentialStoreActions, useCredentialStore } from "@stores/credentialStore";
import { modalActions } from "@stores/modalStore";
import { useUserStore, userActions } from "@stores/userStore";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Checkbox, H3, Label, P } from "sparks-ui";
import { recoverMessageAddress } from "viem";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { create } from "zustand";

type Nullable<T> = T | null;

interface FlowStore {
  challenge: Nullable<string>;
  signature: Nullable<string>;
  credential: Nullable<Record<string, any>>;
  holdings: Nullable<string[]>;
  error: Nullable<string>;
}

const flowStore = create<FlowStore>(() => ({
  challenge: null,
  signature: null,
  credential: null,
  holdings: null,
  error: null,
}));

const useFlowStore = createSelectors(flowStore);

const flowActions = {
  setChallenge: (challenge: string) => flowStore.setState({ challenge }),
  setSignature: (signature: string) => flowStore.setState({ signature }),
  setCredential: (credential: Record<string, any>) => flowStore.setState({ credential }),
  setHoldings: (holdings: string[]) => flowStore.setState({ holdings }),
  reset: () => flowStore.setState({
    challenge: null,
    signature: null,
    credential: null,
    holdings: null,
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
      if (!challenge || !address) return;

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
  }, [data, variables, address])

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

function ChooseHoldings() {
  const [holdings, setHoldings] = useState<Record<string, any>[] | null>(null);

  useEffect(() => {
    ; (async () => {
      if (!!holdings) return;

      const path = `${import.meta.env.SPARKS_ATTESTER}/ethereum/holdings`
      const result = await fetch(path, {
        method: "GET",
        credentials: 'include'
      });

      if (result.status !== 200) {
        flowActions.reset();
        return
      }

      const json = await result.json();
      setHoldings(json);

    })()
  }, [holdings]);

  function handleSubmit(e: any) {
    e.preventDefault();
    
    const selectedHoldings = Array.from(e.target.elements)
      .filter((el: any) => el.checked)
      .map((el: any) => el.id);

    flowActions.setHoldings(selectedHoldings);
    setHoldings(null);
  }

  return (
    <div>
      <H3 className="mb-4 text-center">Choose Holdings</H3>
      {holdings ? (
        <P className="mb-4">Select the holdings you'd like on your credential.</P>
      ) : (
        <P className="mb-4">Loading available holdings...</P>
      )}
      {
        <form onSubmit={handleSubmit}>
          {holdings?.map((holding) => {
            return (
              <div key={holding.address}>
                <Checkbox id={holding.symbol} />
                <Label className="overflow-hidden whitespace-nowrap text-ellipsis" htmlFor={holding.symbol}>{' ' + holding.symbol}</Label>
              </div>
            )
          })}
          <Button type="submit" className="w-full mt-4">Submit</Button>
        </form>
      }
    </div>
  )
}

function ClaimCredential() {
  const attesting = useCredentialStore.use.attesting();
  const signature = useFlowStore.use.signature();
  const challenge = useFlowStore.use.challenge();
  const credential = useFlowStore.use.credential();
  const holdings = useFlowStore.use.holdings();
  const user = useUserStore.use.user();

  useEffect(() => {
    ; (async () => {
      if ((!signature || !challenge) || credential || !user) return;

      const path = `${import.meta.env.SPARKS_ATTESTER}/${attesting}/claim`
      const result = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          signature,
          holdings,
        }),
        credentials: 'include'
      });

      if (result.status !== 200) {
        flowActions.reset();
        return
      }

      const cred = await result.json();
      flowActions.setCredential(cred);
    })()
  }, [signature, challenge, credential, user])

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
  const holdings = useFlowStore.use.holdings();
  const error = useFlowStore.use.error();
  const credential = useFlowStore.use.credential();
  const user = useUserStore.use.user();

  useEffect(() => {
    ; (async () => {
      if (credential && user) {
        flowActions.reset();
        credentialStoreActions.stopFlow();
        modalActions.closeModal();
        toast.success("Credential added", {
          autoClose: 2000,
        });
        user.agents.presenter.addCredential(credential);
        await userActions.save();
      }
    })()
  }, [credential])

  if (!!error) return <div>{error}</div>;

  if (!isConnected) return <ConnectWallet />;

  if (!challenge) return <GetChallenge />;

  if (!signature) return <SignChallenge />;

  if (!holdings) return <ChooseHoldings />;

  return <ClaimCredential />;
}