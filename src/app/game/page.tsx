'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Phaser는 SSR과 호환되지 않으므로 dynamic import 사용
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#2a2a2a] flex flex-col items-center justify-center">
      <p className="text-white text-2xl font-mono mb-6">Loading Game...</p>
      <div className="text-5xl animate-pulse mb-8">🐐</div>
      <div className="w-[320px] h-[50px] bg-black/80 p-[10px]">
        <div className="w-0 h-full bg-white" />
      </div>
    </div>
  ),
})

function GameContent() {
  const searchParams = useSearchParams()
  const nickname = searchParams.get('nickname') || 'Player'

  return (
    <main className="w-full h-screen overflow-hidden">
      <GameCanvas nickname={nickname} />
    </main>
  )
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-black text-white">
          Loading...
        </div>
      }
    >
      <GameContent />
    </Suspense>
  )
}
