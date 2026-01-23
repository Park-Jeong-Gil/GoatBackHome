'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Phaser는 SSR과 호환되지 않으므로 dynamic import 사용
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="text-2xl mb-4">Loading Game...</div>
        <div className="animate-pulse">🐐</div>
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
