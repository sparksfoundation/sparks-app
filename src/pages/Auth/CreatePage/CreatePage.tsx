import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, ErrorMsg, H3, Input, Label, P, clsxm } from 'sparks-ui';
import { useEffect } from "react";
import { randomSalt } from "sparks-sdk/utilities";
import { useUser } from "@stores/user";
import { useMembers } from "@stores/members";
import { Buffer } from "buffer";
import { Paths } from "@routes/paths";

const formSchema = z.object({
  name: z.string().min(1, { message: 'identity name is required' }).max(50),
  password: z.string().min(8, { message: 'password must be at least 8 characters long' }).max(50),
  confirm: z.string().min(8, { message: 'password must be at least 8 characters long' }).max(50),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

type CreatePageSchemaType = z.infer<typeof formSchema>;
type CreatePageHandlerType = SubmitHandler<CreatePageSchemaType>;
type CreatePageFieldTypes = { name: string, password: string, confirm: string };

export const CreatePage = () => {
  const navigate = useNavigate();
  const user = useUser(state => state.user);
  const addMember = useMembers(state => state.addMember);
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
    setFocus('name')
  }, [])

  const onSubmit: CreatePageHandlerType = async (fields: CreatePageFieldTypes) => {
    const { name, password } = fields;
    
    const salt = randomSalt();
    await user.incept({ password, salt });
    user.agents.profile.name = name;

    const b64Name = Buffer.from(name).toString('base64');
    const data = await user.export();
    if (!b64Name || !salt || !data) throw new Error('failed to create identity');

    addMember({ name: b64Name, salt, data });

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
          Creating your SPARK is easy, simply provide a name and master password.
        </P>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Label className="mb-1 block">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="personal"
            registration={register("name")}
          />
          <ErrorMsg>{errors.name?.message}</ErrorMsg>

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