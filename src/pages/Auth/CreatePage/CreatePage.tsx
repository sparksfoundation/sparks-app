import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, ErrorMsg, H3, Input, Label, P, clsxm } from 'sparks-ui';
import { useEffect } from "react";
import { Paths } from "@routes/paths";
import { userActions } from "@stores/userStore";

const formSchema = z.object({
  handle: z.string().min(3, { message: 'identity handle is required' }).max(50),
  password: z.string().min(8, { message: 'password must be at least 8 characters long' }).max(50),
  confirm: z.string().min(8, { message: 'password must be at least 8 characters long' }).max(50),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

type CreatePageSchemaType = z.infer<typeof formSchema>;
type CreatePageHandlerType = SubmitHandler<CreatePageSchemaType>;
type CreatePageFieldTypes = { handle: string, password: string, confirm: string };

export const CreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    register,
    handleSubmit,
    setFocus,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm<CreatePageSchemaType>({
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    setFocus('handle')
  }, [])

  const onSubmit: CreatePageHandlerType = async (fields: CreatePageFieldTypes) => {
    const { handle, password } = fields;
    await userActions.create({ handle, password });
    const state = location.state?.prev ? { prev: { ...location.state.prev } } : undefined;
    navigate(Paths.AUTH_UNLOCK, { state });
  }

  return (
    <div className="relative flex flex-col justify-center items-center h-full p-6 max-w-lg mx-auto">
      <Card className={clsxm("w-full")}>
        <H3 className={clsxm('mb-3 text-center')}>
          Create Your Identity
        </H3>
        <P className="mt-2 mb-6">
          Creating your SPARK is easy, simply provide a handle and master password.
        </P>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Label className="mb-1 block">Handle</Label>
          <Input
            id="handle"
            type="text"
            placeholder="personal"
            registration={register("handle")}
          />
          <ErrorMsg>{errors.handle?.message}</ErrorMsg>

          <Label className="mb-1 mt-1 block">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="long unqiue password"
            registration={register("password")}
          />
          <ErrorMsg>{errors.password?.message}</ErrorMsg>

          <Label className="mb-1 mt-1 block">Confirm</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="long unqiue password"
            registration={register("confirm")}
          />
          <ErrorMsg>{errors.confirm?.message}</ErrorMsg>

          <div className="flex justify-stretch gap-x-4 mt-2">
            <Button onClick={() => navigate('')} color="warning" fullWidth>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} fullWidth>Next</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}