import { useUser } from "@stores/user";
import { useEffect, useState } from "react";
import { PostMessage, WebRTC } from "sparks-sdk/channels";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from "@stores/theme";
import { Button } from "sparks-ui";

const HandleChatInvite = ({ accept }: { accept: Function }) => {
  return (
    <>
      <Button color="success" onClick={() => accept()}>Accept</Button>
    </>
  )
}

export const NotificationProvider = () => {
  const { user } = useUser(state => ({ user: state.user }));
  const { theme } = useTheme(state => ({ theme: state.theme }));

  useEffect(() => {

    PostMessage.handleOpenRequests(async ({ resolve }) => {
      toast(<HandleChatInvite accept={resolve} />);
    }, { spark: user });
    
  }, [theme])

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={50000000}
      hideProgressBar={false}
      closeOnClick={true}
      pauseOnHover={true}
      draggable={true}
      theme={theme}
    />
  )
}