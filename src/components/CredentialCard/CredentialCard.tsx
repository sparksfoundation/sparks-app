import { Button, Card, H5, NoiseBackground, P } from "sparks-ui";
import { CredentialCardMenu } from "./CredentialMenu";
import { modalActions } from "@stores/modalStore";

function getCredentialTitle(credential: Record<string, any>) {
  const type = credential.type[credential.type.length - 1];
  const title = type.replace(/([A-Z])/g, ' $1').trim();
  return title;
}

// recursive function to render object properties as a list with potential sub-lists if needed
function CredentialProp({ prop, value }: { prop: string, value: any }) {
  const isTextProp = Number.parseInt(prop).toString() !== prop;

  if (typeof value === 'object') {
    return (
      <li className="pl-4 overflow-hidden list-none max-w-xl">
        {isTextProp && <P className="whitespace-nowra text-ellipsis overflow-hidden"><span className="font-bold">{prop}:</span></P>}
        <ul>
          {!isTextProp && <P className="inline float-left w-1 -ml-1">-</P>}
          {Object.keys(value).map((key, index) => (
            <CredentialProp key={index} prop={key} value={value[key]} />
          ))}
        </ul>
      </li>
    )
  }

  if (prop === 'id') {
    return <></>
  }

  return (
    <li className="pl-4 overflow-hidden">
      <P className="whitespace-nowrap text-ellipsis overflow-hidden"><span className="font-bold">{prop}</span>: {value}</P>
    </li>
  )
}

export const CredentialCard = ({
  credential
}: {
  credential: Record<string, any>
}) => {

  return (
    <Card className="w-full h-full max-w-sm p-0">
      <header className="relative h-auto p-4">
        <NoiseBackground shade="light" />
        <div className="relative justify-between flex">
          <H5>{getCredentialTitle(credential)}</H5>
          <CredentialCardMenu credential={credential} />
        </div>
      </header>
      <div className="justify-between p-4 overflow-hidden">
        <P></P>
        <P className="overflow-hidden w-full text-ellipsis mb-4 whitespace-nowrap">Address: {credential.credentialSubject.address}</P>
        <Button
          className="w-full"
          onClick={() => modalActions.openModal({
            size: 'auto',
            content: () => (
              <>
                <CredentialProp prop={getCredentialTitle(credential)} value={credential.credentialSubject} />
                <div className="text-center">
                  <Button className="mt-4 mx-auto w-64" onClick={modalActions.closeModal}>Close</Button>
                </div>
              </>
            )
          })}
        >view details</Button>
      </div>
    </Card>
  )
}