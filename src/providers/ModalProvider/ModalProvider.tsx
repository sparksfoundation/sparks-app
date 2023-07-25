import { modalStore } from "@stores/modalStore";
import { Card, H4 } from "sparks-ui";

export const ModalProvider = () => {
  const { title, content, open } = modalStore((state) => state);
  const Content = content;
  return (
    open && content !== null ? (
      <div className="bg-bg-800/80 h-full w-full fixed top-0 left-0 flex items-center justify-center z-50 animate-fade-in" >
        <Card className="w-full max-w-md max-h-[calc(100%-40px)]">
          {title && <H4 className="mb-2 text-center">{title}</H4>}
          <Content />
        </Card>
      </div >
    ) : <></>
  )
}
