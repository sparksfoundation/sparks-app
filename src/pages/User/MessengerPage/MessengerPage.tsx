import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { useUser } from "@stores/user";
import { Card } from "sparks-ui"

export const MessengerPage = () => {
  const user = useUser(state => state.user);

  async function newChat() {

  }

  return (
    <Card className="w-full h-full">

      <PlusCircleIcon
        height={48}
        width={48}
        className="absolute bottom-0 right-0 fill-primary-600 cursor-pointer"
      />
    </Card>
  )
}