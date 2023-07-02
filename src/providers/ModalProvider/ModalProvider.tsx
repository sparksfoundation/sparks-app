import { useModal } from "@stores/modal";
import { Card, H3 } from "sparks-ui";

export const ModalProvider = () => {
  const { modal } = useModal(state => ({ modal: state.modal }));
  return (
    modal ? (
      <div className="bg-bg-800/80 h-full w-full fixed flex items-center justify-center z-50 animate-fade-in" >
        <Card>
          <H3>{modal.heading}</H3>
          {modal.content}
        </Card>
      </div >
    ) : <></>
  )
}
