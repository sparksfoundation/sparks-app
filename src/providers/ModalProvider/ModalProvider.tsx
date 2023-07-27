import { modalStore } from "@stores/modalStore";
import { Card, H4, clsxm } from "sparks-ui";

export const ModalProvider = () => {
  const { title, content, open, size = 'md' } = modalStore((state) => state);
  const Content = content;
  return (
    open && content !== null ? (
      <div className="bg-bg-800/80 h-full w-full fixed top-0 left-0 flex items-center justify-center z-50 animate-fade-in" >
        <Card className={clsxm(
          "w-full max-w-[calc(100%-40px)]",
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-md',
          size === 'lg' && 'max-w-lg',
          size === 'xl' && 'max-w-xl',
          size === 'full' && 'max-h-[calc(100%-40px)]',
          size === 'auto' && 'w-auto',
        )}>
          {title && <H4 className="mb-2 text-center">{title}</H4>}
          <Content />
        </Card>
      </div >
    ) : <></>
  )
}
