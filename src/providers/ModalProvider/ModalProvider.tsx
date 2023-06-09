import { modalStore } from "@stores/refactor/modalStore";
import { Card, H4 } from "sparks-ui";

export const ModalProvider = () => {
  const { title, content, open } = modalStore((state) => state);
  return (
    open ? (
      <div className="bg-bg-800/80 h-full w-full fixed flex items-center justify-center z-50 animate-fade-in" >
        <Card>
          <H4 className="mb-2 text-center">{title}</H4>
          {content}
        </Card>
      </div >
    ) : <></>
  )
}
