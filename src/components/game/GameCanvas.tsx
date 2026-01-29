"use client";

import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { phaserConfig } from "@/lib/phaser/config";

interface GameCanvasProps {
  nickname: string;
}

export default function GameCanvas({ nickname }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // 닉네임 저장 (별도 effect)
  useEffect(() => {
    if (nickname) {
      localStorage.setItem("goat_nickname", nickname);
    }
  }, [nickname]);

  // Phaser 게임 인스턴스 생성 (마운트 시 한 번만)
  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(phaserConfig);

      // 로딩 진행률 이벤트 리스너
      const handleLoadProgress = (e: CustomEvent<number>) => {
        setLoadProgress(e.detail);
      };

      // 게임 준비 완료 이벤트 리스너
      const handleGameReady = () => {
        setIsLoading(false);
      };

      window.addEventListener(
        "loadProgress",
        handleLoadProgress as EventListener,
      );
      window.addEventListener("gameReady", handleGameReady);

      return () => {
        window.removeEventListener(
          "loadProgress",
          handleLoadProgress as EventListener,
        );
        window.removeEventListener("gameReady", handleGameReady);
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* 로딩 화면 - 게임 준비 전까지 표시 */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-[#333] flex flex-col items-center justify-center">
          <p className="text-white text-4xl mb-6">Loading Game...</p>
          <div className="text-5xl animate-pulse mb-8">🐐</div>
          <div className="w-[320px] h-[50px] bg-black/80 p-[10px]">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${loadProgress * 100}%` }}
            />
          </div>
        </div>
      )}
      {/* 게임 컨테이너 */}
      <div id="game-container" className="w-full h-full" />
    </div>
  );
}
