import { Link } from "react-router-dom"
import { Button, Card, H5, P } from "sparks-ui"

export const AppCard = ({
  title,
  image,
  description,
  name,
}: {
  title: string;
  image: string;
  description: string;
  name: string;
}) => {
  return (
    <Card className="p-0 w-full max-w-sm" shade='light'>
      <img className="max-h-60 object-cover" src={image} />
      <div className="p-4">
        <H5 className="text-center mb-2">{title}</H5>
        <P className="text-sm text-justify mb-4">{description}</P>
        <Link to={`/user/apps/${name}`} className="flex justify-center items-center">
          <Button>Learn More</Button>
        </Link>
      </div>
    </Card>
  )
}