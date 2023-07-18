import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { PrivateLayoutHeader } from "@layout";
import { Link } from "react-router-dom";
import { Card, H3 } from "sparks-ui";

export default function SparksFoundationPage() {
  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Sparks Foundation</H3>
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