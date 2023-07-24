import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { PrivateLayoutHeader } from "@layout";
import { StartChatDialog } from "./StartChatDialog";
import { MessengerChat } from "./MessengerChat";
import { modalActions } from "@stores/modalStore";
import { AvailableChannels } from "./AvailableChannels";
import { MessengerChatMenu } from "@components/MessengerChatMenu";
import { useMessengerStore } from "@stores/messengerStore";
import { H3 } from "sparks-ui";

export const NewChatButton = () => {
  const { openModal } = modalActions;
  const channel = useMessengerStore.use.channel();
  if (channel) return <></>

  async function newChat() {
    openModal({
      title: 'Start Chat',
      content: StartChatDialog
    });
  }

  return (
    <button onClick={newChat} className="bg-primary-600 rounded-full overflow-hidden fixed bottom-4 right-4">
      <span className="bg-bg-200 h-1/2 w-1/2 absolute top-1/4 left-1/4"></span>
      <PlusCircleIcon
        height={48}
        width={48}
        className="bottom-0 right-0 fill-primary-600 cursor-pointer relative"
      />
    </button>
  )
}

export const MessengerPage = () => {
  return (
    <>
      <PrivateLayoutHeader>
        <H3 className="text-center grow">Messenger</H3>
      </PrivateLayoutHeader>
      <div className="relative h-full flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
        <MessengerChat />
        <AvailableChannels />
        <NewChatButton />
      </div>
      <div className="absolute z-50 top-5 right-5">
        <MessengerChatMenu />
      </div>
    </>
  )
}
