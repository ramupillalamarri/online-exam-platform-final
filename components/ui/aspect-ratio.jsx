'use client'

import * as RadixRatio from '@radix-ui/react-aspect-ratio'

function AspectRatio({
  ...props
}) {
  return <RadixRatio.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }


