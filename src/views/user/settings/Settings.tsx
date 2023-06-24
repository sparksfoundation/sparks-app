import { useState } from "react";
import { H4, P, clsxm } from "sparks-ui";
import { Details } from "./Details";
import { EventLog } from "./EventLog";
import { ExportIdentity } from "./ExportIdentity";

const TABS = [
  { label: "Details", component: Details },
  { label: "Event Log", component: EventLog },
  { label: "Export Identity", component: ExportIdentity },
];

export const Settings = () => {
  const [tab, setTab] = useState(0);

  const Component = TABS[tab]?.component;

  return (
    <div className="w-full h-full flex flex-col">
      <H4 className="text-fg-800 dark:text-fg-300 font-bold mb-4">
        Identity Settings
      </H4>
      <section className="mb-4 mr-4">
        {TABS.map((item, index) => (
          <div
            className="inline-block cursor-pointer relative mr-6"
            key={index}
            onClick={() => setTab(index)}
          >
            <P
              className={clsxm(
                index === tab &&
                  "text-primary-600 dark:text-primary-600 font-bold select-none",
                "text-sm mb-1"
              )}
            >
              {item.label}
            </P>
            <span
              className={clsxm(
                "absolute h-0.5 w-full bottom-0 bg-transparent block left-0",
                index === tab && "bg-primary-600"
              )}
            />
          </div>
        ))}
      </section>
      <Component />
    </div>
  );
};
