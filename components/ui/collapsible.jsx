'use client'

import * as RadixCollapsible from '@radix-ui/react-collapsible'

function Collapsible({
  ...props
}) {
  return <RadixCollapsible.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}) {
  return (
    <RadixCollapsible.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}) {
  return (
    <RadixCollapsible.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }


