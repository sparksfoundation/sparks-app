import { ReactNode } from "react";
import { Card, H3, P, clsxm } from 'sparks-ui'
import { CheckIcon } from "@heroicons/react/20/solid";

type IntroCardProps = {
  footer?: ReactNode,
  title: string,
  className?: string,
  description: string,
  items: string[],
  highlighted?: boolean,
}

export const IntroCard = ({
  className = '',
  description,
  footer,
  highlighted = false,
  items,
  title,
}: IntroCardProps) => (
  <Card className={clsxm("w-64", className)}>
    <H3 className={clsxm('text-center', highlighted && 'text-primary-600 dark:text-primary-600')}>{title}</H3>
    <P className="mt-2 mb-6 text-center">
      {description}
    </P>
    <ul role="list" className={clsxm("space-y-3 leading-6 text-inherit", footer && 'mb-8')}>
      {items.map ((item, index) => (
        <li key={index} className="flex gap-x-3 text-inherit items-center">
          <CheckIcon
            className={clsxm("h-5 w-5 flex-none text-fg-800 dark:text-fg-200",
            highlighted && 'text-primary-600 dark:text-primary-600')} aria-hidden="true" />
          <P>{item}</P>
        </li>
      ))}
    </ul>
    <>
      {footer ? footer : <></>}
    </>
  </Card>
)
