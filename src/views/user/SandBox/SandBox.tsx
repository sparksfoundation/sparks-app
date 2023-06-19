import { useUser } from "@stores/user"
import { ReactComponentElement, useState } from "react";
import { RelayService } from "./Workbench/RelayService";
import { WebsiteChannels } from "./WebsiteChannels";
import { WebRTCChannels } from "./WebRTCChannels";
import { clsxm, P } from "sparks-ui";

export const SandBox = () => {
  const user = useUser(state => state.user);
  const [tab, setTab] = useState(0);
  const tabs = [
    { label: 'Website Channels', component: WebsiteChannels },
    { label: 'WebRTC Channels', component: WebRTCChannels },
    { label: 'Workbench', component: RelayService },
  ];

  const Component = tabs[tab].component as any;

  return (
    <div className="w-full h-full flex flex-col">
      <section className="mb-4">{tabs.map((item, index) => (
        <div
          className="inline-block cursor-pointer p-2 relative"
          key={index}
          onClick={() => setTab(index)}
        >
          <P className={clsxm(index === tab && "text-primary-600 dark:text-primary-600 font-bold")}>{item.label}</P>
          <span className={clsxm("absolute h-0.5 w-full bottom-0 bg-transparent block left-0", index === tab && "bg-primary-600")} />
        </div>
      ))}</section>
      <Component />
    </div>
  )
}