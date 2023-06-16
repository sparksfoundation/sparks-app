import { clsxm } from "sparks-ui";
import { DivProps } from "react-html-props";
import { SetName } from "./SetName";
import { useEffect, useState } from "react";
import { SetPassword } from "./SetPassword";
import { ConfirmPassword } from "./ConfirmPassword";
import { Identity } from "@libs/identity";
import { useMembers } from "@stores/members";
import { Buffer } from "buffer";
import { useLocation, useNavigate } from "react-router-dom";

type onSubmitTypes = {
  name?: string | undefined;
  password?: string | undefined;
  confirm?: string | undefined;
}

export const Create = ({ className = '' }: DivProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const successUrl = location.state?.hre || '/auth/unlock'
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { addMember } = useMembers(state => ({ addMember: state.addMember }))

  function onSubmit(key: string, data: onSubmitTypes) {
    if (key === 'name') setName(data.name || '')
    if (key === 'password') setPassword(data.password || '')
    if (key === 'confirm') {
      const passwordMatch = data.confirm === password;
      if (passwordMatch) setConfirmed(passwordMatch)
      if (!passwordMatch) setError('passwords do not match')
    }
  }

  async function createUser({ name, password }: { name: string, password: string }) {
    const identity = Identity;
    // todo: fix types inference with module augmentation
    await identity.controller.incept({ password } as any) 
    const b64Name = Buffer.from(name).toString('base64')
    const { salt, data } = await identity.controller.export()
    if (!b64Name || !salt || !data) throw new Error('failed to create identity')
    addMember({ name: b64Name, salt, data })
    navigate(successUrl)
  }

  useEffect(() => {
    if (!confirmed) return;
    createUser({ name, password })
  }, [confirmed])

  const showSetName = name === '';
  const showSetPassword = name !== '' && password === '';
  const showConfirmPassword = (name !== '' && password !== '') && !confirmed;

  return (
    <div className="relative flex flex-col justify-center items-center h-full p-6 max-w-lg mx-auto">

    <div className={clsxm("max-w-64", className)}>
      <SetName
        onSubmit={data => onSubmit('name', data as onSubmitTypes)}
        className={clsxm('hidden', showSetName && 'block')}
      />
      <SetPassword
        onSubmit={data => onSubmit('password', data as onSubmitTypes)}
        className={clsxm('hidden', showSetPassword && 'block')}
      />
      <ConfirmPassword
        error={error}
        onSubmit={data => onSubmit('confirm', data as onSubmitTypes)}
        className={clsxm('hidden', showConfirmPassword && 'block')}
      />
    </div>
    </div>
  )
}
