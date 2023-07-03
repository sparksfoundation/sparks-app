import { ReactNode, useEffect, useState } from "react"
import { UseBoundStore } from "zustand"

export const StoresLoader = ({ stores, children }: { stores: UseBoundStore<any>[], children: ReactNode  }) => {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (done) return
    (async () => {
      await Promise.all(stores.map((storage) => {
        return new Promise((resolve) => {
          storage.persist.onFinishHydration(resolve)
        })
      }))
      setDone(true)
    })()
  })
  return <>{done ? children : <></>}</>
}