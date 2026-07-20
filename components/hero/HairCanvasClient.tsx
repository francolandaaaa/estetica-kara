'use client'

import dynamic from 'next/dynamic'

const HairCanvas = dynamic(() => import('@/components/hero/HairCanvas'), { ssr: false })

export default function HairCanvasClient() {
  return <HairCanvas />
}
