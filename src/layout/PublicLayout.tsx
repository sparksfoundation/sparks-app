import { Outlet } from "react-router-dom"
import { NoiseBackground, Triangle } from "sparks-ui"
import { ThemeSwitcher } from "@components/ThemeSwitcher"

export const PublicLayout = () => {
  return (
    <div className="w-full h-full overflow-hidden absolute">
      <NoiseBackground />
      <Triangle className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />
      <Triangle className="left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2" />
      <ThemeSwitcher className="absolute top-4 right-4" />
      <div className="flex flex-col justify-center h-full">
        <div className="w-full h-auto max-h-full overflow-y-auto absolute">
          <Outlet />
        </div>
      </div>
    </div>
  )
}