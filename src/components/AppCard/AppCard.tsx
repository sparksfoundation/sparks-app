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
    <Card className="p-0 w-full max-w-sm overflow-hidden flex" shade='light'>
      <div className="flex flex-col justify-stretch h-full">
        <img className="h-60 w-full object-center object-cover grow-0" src={image} />
        <div className="p-4 flex flex-col items-stretch grow">
          <H5 className="text-center mb-2">{title}</H5>
          <P className="text-sm text-justify mb-4 grow">{description}</P>
          <Link to={`/user/apps/${name}`} className="flex justify-center items-center">
            <Button {...btnProps}>{label}</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}