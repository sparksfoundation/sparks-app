import { PrivateLayoutHeader } from "@layout";
import apps from './apps';
import { useParams } from "react-router-dom";
import { Card, H3 } from "sparks-ui";

export default function Placholder() {
  return (
    <Card className="p-0 w-full max-w-sm invisible" shade='light'>
    </Card>
  )
}

export const AppsPage = () => {
  const { appName } = useParams();
  const activeApp = appName && apps.find(app => app.name === appName);
  if (activeApp) return <activeApp.page />

  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Apps & Services</H3>
      </PrivateLayoutHeader>
      <div className="flex gap-4 px-3 w-full h-full overflow-auto items-start justify-center flex-wrap">
        {apps.map((app) => (
          <app.card key={app.name} />
        ))}
        {apps.length % 2 !== 0 && <Placholder />}
      </div>
    </>
  )
}