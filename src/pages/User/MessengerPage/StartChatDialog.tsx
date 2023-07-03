import { zodResolver } from "@hookform/resolvers/zod";
import { useChannels } from "@stores/channels";
import { useModal } from "@stores/modal";
import { useUser } from "@stores/user";
import { useState } from "react";
import { FieldErrors, SubmitHandler, UseFormRegister, useForm } from "react-hook-form";
import { ChannelEventType, ChannelOpenRejectionEvent, WebRTC } from "sparks-sdk/channels";
import { Button, ErrorMsg, Input, Label, P } from "sparks-ui";
import { z } from "zod";

const formSchema = z.object({
    identifier: z.string().length(145, { message: 'invalid identifier' }),
});

type StartChatDialogSchemaType = z.infer<typeof formSchema>;
type StartChatDialogHandlerType = SubmitHandler<StartChatDialogSchemaType>;

export type StartChatDialogFieldTypes = { identifier: string };
export type StartChatDialogRegisterType = UseFormRegister<StartChatDialogFieldTypes>;
export type StartChatDialogErrorsType = FieldErrors<StartChatDialogFieldTypes>;

export const StartChatDialog = ({ onConnected }: { onConnected: (channel: WebRTC) => void }) => {
    const [identifier, setIdentifier] = useState('');
    const [status, setStatus] = useState('');
    const { user } = useUser(state => ({ user: state.user }));
    const { closeModal } = useModal(state => ({ closeModal: state.closeModal }));

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        }
    } = useForm<StartChatDialogSchemaType>({
        resolver: zodResolver(formSchema)
    });

    const onSubmit: StartChatDialogHandlerType = async (fields: StartChatDialogFieldTypes) => {
        return new Promise(async (resolve, reject) => {
            setStatus('attempting connection...');

            const { identifier } = fields;
            const channel = new WebRTC({
                peerIdentifier: identifier,
                spark: user,
            });

            const confirmation = await channel.open();

            if ((confirmation as ChannelOpenRejectionEvent).type === ChannelEventType.OPEN_REJECTION) {
                setStatus('peer rejected connection');
                return reject();
            }

            setStatus('peer connection accepted');
            onConnected(channel);
            closeModal();
            resolve(void 0);
        })
    }

    function onReset(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIdentifier('');
        closeModal();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} onReset={onReset}>
            <Label htmlFor="identifier">Peer Identifier</Label>
            <Input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                registration={register('identifier')}
                autoComplete="off"
            />
            <ErrorMsg>{errors.identifier?.message}</ErrorMsg>
            <div className="flex gap-2 justify-stretch">
                <Button className="grow" disabled={isSubmitting} type="reset" color="warning">Cancel</Button>
                <Button className="grow" disabled={isSubmitting} type="submit">Start Chat</Button>
            </div>
            {isSubmitting && <P className="text-sm mt-3 text-center">{status}</P>}
        </form>
    )
}