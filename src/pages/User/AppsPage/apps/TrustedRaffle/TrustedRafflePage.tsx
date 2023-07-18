import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { PrivateLayoutHeader } from "@layout";
import { Link } from "react-router-dom";
import { Card, H3, P } from "sparks-ui";

export default function TrustedRafflePage() {
  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Trusted Raffle Page</H3>
        <Link to="/user/apps" className="flex items-center mr-2 absolute right-0">
          <P className="flex items-center"><ArrowLeftIcon className="h-5 w-5 mr-1" /> Back</P>
        </Link>
      </PrivateLayoutHeader>

      <Card className="w-full h-full">
      </Card>
    </>
  )
}