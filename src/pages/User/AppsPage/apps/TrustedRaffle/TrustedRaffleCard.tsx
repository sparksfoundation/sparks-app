import { Link } from "react-router-dom";
import { Button, Card, H5, P } from "sparks-ui";
import trustedraffle from './trustedraffle.jpeg';

export default function TrustedRaffleCard() {
  return (
    <Card className="p-0 w-full max-w-sm" shade='light'>
      <img src={trustedraffle} />
      <div className="p-4">
        <H5 className="text-center mb-2">Trusted Raffle</H5>
        <P className="text-sm text-justify mb-4">Provides an example of personalized content experience based on your information, no login or server side data required.</P>
        <Link to="/user/apps/trusted-raffle" className="flex justify-center items-center">
          <Button>Learn More</Button>
        </Link>
      </div>
    </Card>
  )
}