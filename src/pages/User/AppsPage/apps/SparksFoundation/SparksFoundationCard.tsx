import { Link } from "react-router-dom";
import { Button, Card, H5, P } from "sparks-ui";
import sparksfoundatiom from './sparksfoundation.png';

export default function SparksFoundation() {
  return (
    <Card className="p-0 w-full max-w-sm" shade='light'>
      <img src={sparksfoundatiom} />
      <div className="p-4">
        <H5 className="text-center mb-2">SPARKS Foundation</H5>
        <P className="text-sm text-justify mb-4">Provides an example of personalized content experience based on your information, no login or server side data required.</P>
        <Link to="/user/apps/sparks-foundation" className="flex justify-center items-center">
          <Button>Learn More</Button>
        </Link>
      </div>
    </Card>
  )
}

