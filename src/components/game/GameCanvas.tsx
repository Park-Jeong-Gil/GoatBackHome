"use client";

import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { phaserConfig } from "@/lib/phaser/config";
import HowToPlayModal from "@/components/ui/HowToPlayModal";

interface GameCanvasProps {
  nickname: string;
}

export default function GameCanvas({ nickname }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

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
      {/* How to Play 버튼 */}
      {!isLoading && (
        <button
          onClick={() => setShowHowToPlay(true)}
          className="absolute top-4 right-4 z-20 px-3 py-2 bg-black/50 hover:bg-black/70 text-white text-sm font-bold rounded-lg transition-colors"
        >
          HOW TO PLAY
        </button>
      )}

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      {/* 게임 컨테이너 */}
      <div id="game-container" className="w-full h-full" />
    </div>
  );
}
