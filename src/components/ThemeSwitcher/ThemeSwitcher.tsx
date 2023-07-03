import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { themeActions } from "@stores/refactor/themeStore";
import { clsxm } from "sparks-ui";

export const ThemeSwitcher = ({ className = '', fill = '' }: { className?: string, fill?: string }) => {

  const classes = clsxm(
    "cursor-pointer w-6 h-6",
    "text-slate-700 dark:text-slate-200",
  )
  return (
    <button className={clsxm("absolute top-4 right-4 z-10 p-1 cursor-pointer", className)} onClick={themeActions.toggle}>
      <SunIcon className={clsxm(classes, fill, 'hidden dark:block')} />
      <MoonIcon className={clsxm(classes, fill, 'block dark:hidden')} />
    </button>
  )
}