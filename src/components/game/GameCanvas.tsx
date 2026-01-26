'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { phaserConfig } from '@/lib/phaser/config'

interface GameCanvasProps {
  nickname: string
}

export default function GameCanvas({ nickname }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null)

  // 닉네임 저장 (별도 effect)
  useEffect(() => {
    if (nickname) {
      localStorage.setItem('goat_nickname', nickname)
    }
  }, [nickname])

  // Phaser 게임 인스턴스 생성 (마운트 시 한 번만)
  useEffect(() => {
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
  }, [])

  return (
    <div
      id="game-container"
      className="w-full h-full flex items-center justify-center bg-black"
    />
  )
}
