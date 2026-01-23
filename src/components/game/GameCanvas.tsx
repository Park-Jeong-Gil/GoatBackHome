'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { phaserConfig } from '@/lib/phaser/config'

interface GameCanvasProps {
  nickname: string
}

export default function GameCanvas({ nickname }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    // 닉네임 저장
    if (nickname) {
      localStorage.setItem('goat_nickname', nickname)
    }

    // Phaser 게임 인스턴스 생성
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(phaserConfig)
    }

    // 클린업
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [nickname])

  return (
    <div
      id="game-container"
      className="w-full h-full flex items-center justify-center bg-black"
    />
  )
}
