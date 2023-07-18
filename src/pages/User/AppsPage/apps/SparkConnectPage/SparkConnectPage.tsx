import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { PrivateLayoutHeader } from "@layout";
import { useUserStore } from "@stores/userStore";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { PostMessage } from "sparks-sdk/channels/ChannelTransports";
import { Button, Card, H3, H5, H6, P } from "sparks-ui";

export function Explainer() {
  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Spark Connect</H3>
        <Link to="/user/apps" className="flex items-center mr-4 absolute right-0">
          <P className="flex items-center"><ArrowLeftIcon className="h-5 w-5 mr-1" /> Back</P>
        </Link>
      </PrivateLayoutHeader>
      <div className="flex justify-center items-start gap-4">
        <Card shade="light" className="w-full max-w-md">
          <H5 className="mb-2">PostMessage (PoC Complete)</H5>
          <P className="mb-4 text-justify">
            Connect your front end website to a SPARK user and request data and credentials to provide a tailored user experience, no server side code required. 
          </P>
          <P>
            Visit <Link to="https://sparks.foundation"><P className="inline" color="primary">Sparks Foundation</P></Link> and connect via bottom right to try it out.
          </P>
        </Card>
        <Card shade="light" className="w-full max-w-md">
          <H5 className="mb-2">RestAPI</H5>
          <P className="mb-4 text-justify">
            Connect your backend to a SPARK user to receive and verify user information. This provides a more secure connection and allows you to do things like gate content access. 
          </P>
          <P>
            Channel functionality complete, SPARK connect integration in planning.
          </P>
        </Card>
        <Card shade="light" className="w-full max-w-md">
          <H5 className="mb-2">WebRTC</H5>
          <P className="mb-4 text-justify">
            Connect a stream to a SPARK user for real-time text and video chat. This provide a direct communication channel and allows you to exchange data and credentials in real-time.
          </P>
          <P>
            Channel functionality complete, SPARK connect integration in planning.
          </P>
        </Card>
      </div>
    </>
  )
}

export function WebsitePostMessage(params: any) {
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
      setWaiting(false);
      setConnection(channel);
    });
    channel.open();
  }

  const clearChannel = () => {
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
        <H3 className="text-center grow">Spark Connect</H3>
        <Link to="/user/apps" className="flex items-center mr-4 absolute right-0">
          <P className="flex items-center"><ArrowLeftIcon className="h-5 w-5 mr-1" /> Back</P>
        </Link>
      </PrivateLayoutHeader>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md p-0">
          <img src={params.banner} className="max-h-72 w-full object-cover object-top" />
          <div className="p-4">
            <P>{params.description}</P>
            <H6 className="mt-4 mb-2">Requesting Data</H6>
            <ul className="list-disc list-inside">
              {dataQuery.map((path: string) => (
                <P key={path}>{path.split('.').pop()}</P>
              ))}
            </ul>
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

export default function SparkConnectPage() {
  const location = useLocation();
  const search = location.state?.search;
  console.log(search);
  return search && search.origin ? (
    <WebsitePostMessage {...search} />
  ) : (
    <Explainer />
  );
}