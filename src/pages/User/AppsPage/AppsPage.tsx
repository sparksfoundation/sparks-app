import { PrivateLayoutHeader } from "@layout";
import apps from './apps';

export const AppsPage = () => (
  <>
    <PrivateLayoutHeader title="Apps" />
    <div className="flex gap-2 w-full items-stretch">
      {apps.map((app, i) => (
        <app.card key={i} />
      ))}
    </div>
  </>
)