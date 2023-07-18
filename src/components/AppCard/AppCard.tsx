import { Link } from "react-router-dom"
import { Button, Card, H5, P } from "sparks-ui"

export const AppCard = ({
  title,
  image,
  description,
  name,
  button,
}: {
  title: string;
  image: string;
  description: string;
  name: string;
  button: any;
}) => {
  const { label, ...btnProps } = button;
  return (
    <Card className="p-0 w-full max-w-sm overflow-hidden" shade='light'>
      <img className="h-60 w-full object-bottom object-cover" src={image} />
      <div className="p-4">
        <H5 className="text-center mb-2">{title}</H5>
        <P className="text-sm text-justify mb-4">{description}</P>
        <Link to={`/user/apps/${name}`} className="flex justify-center items-center">
          <Button {...btnProps}>{label}</Button>
        </Link>
      </div>
    </Card>
  )
}