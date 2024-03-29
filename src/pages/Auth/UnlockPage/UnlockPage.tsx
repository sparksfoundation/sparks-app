import { z } from "zod";
import { FieldErrors, SubmitHandler, UseFormRegister, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, ErrorMsg, H3, Input, Label, P, clsxm } from 'sparks-ui';
import { useEffect } from "react";
import { useUserStore, userActions } from "@stores/userStore";

const formSchema = z.object({
  password: z.string().min(8, { message: 'invalid password' }).max(50),
});

type UnlockPageSchemaType = z.infer<typeof formSchema>;
type UnlockPageHandlerType = SubmitHandler<UnlockPageSchemaType>;

export type UnlockPageFieldTypes = { password: string };
export type UnlockPageRegisterType = UseFormRegister<UnlockPageFieldTypes>;
export type UnlockPageErrorsType = FieldErrors<UnlockPageFieldTypes>;

export const UnlockPage = () => {
  const account = useUserStore.use.account();

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    setValue,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm<UnlockPageSchemaType>({
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    setFocus('password')
  }, [])

  const onSubmit: UnlockPageHandlerType = async (fields: UnlockPageFieldTypes) => {
    await userActions.login({ password: fields.password })
      .catch(() => {
        const message = 'invalid password';
        setValue('password', '');
        setError('password', { message });
      });
  }

  return (
    <div className="relative flex flex-col justify-center items-center h-full p-6 max-w-lg mx-auto">
      <Card className={clsxm("w-full")}>
        <H3 className={clsxm('mb-3 text-center')}>
          Welcome back {account()}!
        </H3>
        <P className="mt-2 mb-6">
          Enter your password to unlock your SPARK.
        </P>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Label className="mb-1 block">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="master password"
            registration={register("password")}
          />
          <ErrorMsg>{errors.password?.message}</ErrorMsg>
          <div className="flex justify-stretch gap-x-4 mt-2">
            <Button type="submit" disabled={isSubmitting} fullWidth>Next</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
