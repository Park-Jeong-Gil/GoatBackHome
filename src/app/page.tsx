"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GoatImage from "../../public/assets/sprites/goat_idle.png";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  // localStorage에서 저장된 닉네임 불러오기
  useEffect(() => {
    const savedNickname = localStorage.getItem("goat_nickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  const handlePlay = () => {
    if (nickname.trim()) {
      localStorage.setItem("goat_nickname", nickname.trim());
      router.push(`/game?nickname=${encodeURIComponent(nickname.trim())}`);
    } else {
      router.push("/game?nickname=Player");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePlay();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* 타이틀 */}
        <h1
          className="text-4xl font-bold text-gray-800 mb-2"
          style={
            {
              // fontVariationSettings: `"wght" 900, "ital" 1`,
              // textAlign: "center",
              // color: "transparent",
              // WebkitTextStroke: "2px #d6f4f4",
              // color: "#ff003c",
              // textShadow: `5px 5px 0px #07bccc`,
            }
          }
        >
          GOAT BACK HOME
        </h1>
        <p className="text-gray-500 mb-6 text-lg">
          I'm insanely desperate to go home.
        </p>

        {/* 산양 아이콘 */}
        <div className="text-6xl mb-8">
          <Image
            src={GoatImage}
            alt="Goat Icon"
            width={100}
            height={100}
            className="inline-block mr-2"
          />
        </div>

        {/* 닉네임 입력 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Nickname Input (Max 12 characters)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 12))}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-sky-500 focus:outline-none text-center text-lg text-gray-600"
          />
        </div>

        {/* 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={handlePlay}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-lg transition-colors shadow-lg"
          >
            PLAY GAME
          </button>

          <button
            onClick={() => router.push("/leaderboard")}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-lg font-semibold rounded-lg transition-colors"
          >
            LEADERBOARD
          </button>

          <button
            onClick={() =>
              alert(
                "조작법:\n\n⬅️➡️ 방향키: 점프 방향\nSPACE: 점프 (길게 누르면 차징)\n\n목표: 산 정상까지 올라가세요!\n주의: 표범에게 잡히면 게임오버!",
              )
            }
            className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold rounded-lg transition-colors"
          >
            HOW TO PLAY
          </button>
        </div>

        {/* 푸터 */}
        <p className="mt-8 text-sm text-gray-500">
          © 2026 by girgir. All rights reserved.
        </p>
      </div>
    </main>
  );
}
