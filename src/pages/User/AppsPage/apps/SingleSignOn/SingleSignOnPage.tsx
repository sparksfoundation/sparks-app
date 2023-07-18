import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { PrivateLayoutHeader } from "@layout";
import { useUserStore } from "@stores/userStore";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { PostMessage } from "sparks-sdk/channels/ChannelTransports";
import { Button, Card, H3, H6, P } from "sparks-ui";

export function Explainer() {
  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Single SignOn</H3>
        <Link to="/user/apps" className="flex items-center mr-2">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          <span>Back</span>
        </Link>
      </PrivateLayoutHeader>
      <Card className="w-full h-full">
      </Card>
    </>
  )
}

export function Website(params: any) {
  const [status, setStatus] = useState('not connected');
  const [waiting, setWaiting] = useState(false);
  const [connection, setConnection] = useState<PostMessage | null>(null);
  const user = useUserStore.use.user();

  const source = window.opener;
  if (!user || !source) {
    toast.error(`Lost source window for ${params.name}, please try again.`);
    return <Explainer />;
  }

  const data = {} as { [key: string]: any };
  const dataQuery = params?.query?.data || [];
  dataQuery.forEach((path: string) => {
    const value = path.split('.').reduce((acc: any, key: string) => {
      if (acc) return acc[key];
      return null;
    }, user);
    data[path] = value;
  });

  async function connect() {
    const source = window.opener;
    if (!user || !source) return;

    setWaiting(true);
    setStatus('connecting');

    const channel = new PostMessage({
      peer: { url: params.url },
      source,
      spark: user
    })

    channel.on([
      channel.requestTypes.CLOSE_REQUEST,
      channel.confirmTypes.CLOSE_CONFIRM,
    ], () => {
      clearChannel();
    })

    channel.on(channel.confirmTypes.OPEN_CONFIRM, async () => {
      const data = {} as { [key: string]: any };
      const dataQuery = params?.query?.data || [];
      dataQuery.forEach((path: string) => {
        const value = path.split('.').reduce((acc: any, key: string) => {
          if (acc) return acc[key];
          return null;
        }, user);
        data[path] = value;
      });
      await channel.message(data);
      setStatus('connected');
      setWaiting(false);
      setConnection(channel);
    });

    channel.open();
  }

  const clearChannel = () => {
    setStatus('');
    setConnection(null);
    setWaiting(false);
  }

  async function disconnect() {
    if (!connection || !connection.state.open) return;
    setWaiting(true);
    connection.close()
      .catch(clearChannel);
  }

  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Single Sign On</H3>
        <Link to="/user/apps" className="flex items-center mr-2 absolute right-0">
          <P className="flex items-center"><ArrowLeftIcon className="h-5 w-5 mr-1" /> Back</P>
        </Link>
      </PrivateLayoutHeader>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md p-0">
          <img src={params.banner} className="max-h-72 w-full object-cover object-top" />
          <div className="p-4">
            <P>{params.description}</P>
            <H6 className="mt-4 mb-2">Requesting Data</H6>
            <P>
              <ul className="list-disc list-inside">
                {dataQuery.map((path: string) => (
                  <li key={path}>{path.split('.').pop()}</li>
                ))}
              </ul>
            </P>
            <Button
              onClick={connection ? disconnect : connect}
              className='flex mt-6 justify-center items-center'
              color={connection ? 'warning' : 'primary'}
              fullWidth
              disabled={waiting}
            >
              {connection ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}

export default function SingleSignOnPage() {
  const location = useLocation();
  const search = location.state?.search;
  return search && search.origin ? (
    <Website {...search} />
  ) : (
    <Explainer />
  );
}