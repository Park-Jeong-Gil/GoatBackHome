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

    console.log(
      `
%c _____         _         _____                 _
%c|     | ___  _| | ___   |   __| ___  ___  ___ | |_  ___  ___
%c|   --|| . || . || -_|  |  |  ||  _|| .'|| . ||   || -_||  _|
%c|_____||___||___||___|  |_____||_|  |__,||  _||_|_||___||_|
%c                                         |_|
📞 010-4468-7412
📧 wjdrlf5986@naver.com
`,
      "color:#22577A",
      "color:#38A3A5",
      "color:#57CC99",
      "color:#80ED99",
      "color:#99FFED",
    );
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
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl px-4 py-10 w-full max-w-md text-center">
        {/* 타이틀 */}
        <h1 className="title text-4xl font-bold mb-3">GOAT BACK HOME</h1>
        <p className="text-gray-500 mb-6 text-md">
          I'm insanely desperate to go home.
        </p>

        {/* 산양 아이콘 */}
        <div className="text-6xl mb-4">
          <Image
            src={GoatImage}
            alt="Goat Icon"
            width={100}
            // height={100}
            className="inline-block mr-2"
            style={{ height: "auto" }}
          />
        </div>

        <div className="px-4">
          {/* 닉네임 입력 */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Nickname Input (Max 12 characters)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 12))}
              onKeyDown={handleKeyDown}
              className="pixel-ui w-full px-4 py-3 text-center text-lg text-gray-600"
            />
          </div>

          {/* 버튼들 */}
          <div className="space-y-3 flex flex-col gap-3">
            <button
              onClick={handlePlay}
              className="pixel-ui w-full py-4 text-white text-xl font-bold bg-[#548ced]"
            >
              PLAY GAME
            </button>

            <button
              onClick={() => router.push("/leaderboard")}
              className="pixel-ui w-full py-3 text-white text-lg font-semibold bg-[#3bc6d8]"
            >
              RANKING BOARD
            </button>

            <button
              onClick={() =>
                alert(
                  "조작법\n⬅️➡️: 점프 방향\nSPACE or ⬆️: 점프 (길게 누르면 차징)\n방향키를 누른채 점프를 해야 방향대로 이동 합니다.\n오직 점프만으로 정상까지 이동하세요!\n\n주의: 표범에게 잡히면 게임오버! \n\n※ 이 게임은 Nexile의 'Jump King'에서 영감을 받았습니다.",
                )
              }
              className="pixel-ui w-full py-3 text-white text-lg font-semibold bg-[#939393]"
            >
              HOW TO PLAY
            </button>
          </div>
        </div>

        {/* 푸터 */}
        <p className="mt-8 text-sm text-gray-500">
          © 2026 by{" "}
          <a
            href="https://girgir.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            girgir
          </a>
          . All rights reserved.
        </p>
      </div>
    </main>
  );
}
