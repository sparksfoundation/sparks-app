import { DivProps } from "react-html-props";
import { Member, useMembers } from "@stores/members";
import { Button, Card, H3, P, clsxm, Input, Label, Error } from "sparks-ui";
import { Buffer } from "buffer";
import { useState } from "react";
import { useUser } from "@stores/user";
import { Identity } from "@libs/identity";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormEventHandler, useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, { message: 'name required' }).max(50),
  data: z.string().min(1, { message: 'data required' }).max(Number.MAX_SAFE_INTEGER),
  salt: z.string().min(1, { message: 'salt required' }).max(Number.MAX_SAFE_INTEGER),
  password: z.string().min(1, { message: 'password required' }).max(50),
});

type FormSchemaType = z.infer<typeof formSchema>;
type FormHandlerType = FormEventHandler<HTMLDivElement> & SubmitHandler<FormSchemaType>

type UnlockFormProps = {
  onSubmit: FormHandlerType;
  className?: string;
  identity: Member;
  children?: React.ReactNode;
  error: string | undefined;
}

export const UnlockForm = ({ identity, error, className = '', onSubmit }: UnlockFormProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormSchemaType>({ resolver: zodResolver(formSchema), defaultValues: { name: identity.name, data: identity.data, salt: identity.salt, password: '' } });

  useEffect(() => {
    if (error) setError('password', { message: error })
  }, [error])

  return (
    <Card className={clsxm("w-full", className)}>
      <H3 className={clsxm('mb-2 text-center')}>
        Master Password
      </H3>
      <P className="mt-2 mb-8 text-left">
        Please enter your master password for your '{Buffer.from(identity.name, 'base64').toString('utf-8')}' identity
      </P>
      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
        <Input
            id="salt"
            type="hidden"
            registration={register("salt")}
          />
          <Input
            id="data"
            type="hidden"
            registration={register("data")}
          />
          <Label>Password</Label>
          <Input
            id="password"
            type="password"
            registration={register("password")}
          />
          <Error>{errors.password?.message}</Error>
        </div>
        <div className="flex justify-stretch gap-x-4">
          <Button onClick={() => navigate('/')} color="warning" fullWidth>Back</Button>
          <Button type="submit" disabled={isSubmitting} fullWidth>Unlock</Button>
        </div>
      </form>
    </Card>
  )
}



type onSubmitTypes = {
  name?: string | undefined;
  salt?: string | undefined;
  data?: string | undefined;
  password?: string | undefined;
}

export const Unlock = ({ className = '' }: DivProps) => {
  const { members } = useMembers(state => ({ members: state.members }))
  const [error, setError] = useState<string | undefined>(undefined)
  const [unlocking, setUnlocking] = useState<Member | undefined>()
  const { login } = useUser(state => ({ login: state.login }))

  async function onSubmit(args: onSubmitTypes) {
    try {
      const { name, data, salt, password } = args
      const identity = Identity;
      const utf8Name = Buffer.from(name as string, 'base64').toString('utf-8');
      identity.agents.user.name = utf8Name as string;
      await identity.import({ data: data, password, salt } as any);
      login(identity)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="relative flex flex-col justify-center items-center h-full p-6 max-w-lg mx-auto">

    <div className={clsxm("max-w-64", className)}>
      {!unlocking && (
        <Card>
          <H3 className={clsxm('mb-2 text-center')}>
            Unlock Identity
          </H3>
          <P className="mt-2 mb-2 text-left">
            Choose an identity to unlock. You will be prompted for your master password you used to create the identity.
          </P>
          {members.map((member) => (
            <div key={`unlock-member-${member.salt}`}>
              <Button onClick={() => setUnlocking(member)} className="my-2" fullWidth>
                {Buffer.from(member.name, 'base64').toString('utf-8')}
              </Button>
            </div>
          ))}
        </Card>
      )}
      {unlocking && (
        <UnlockForm
          error={error}
          onSubmit={onSubmit}
          identity={unlocking}
        />
      )}
    </div>
    </div>
  )
}
