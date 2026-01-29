"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScoreData } from "@/types/game.d";

interface LeaderboardResponse {
  scores: ScoreData[];
  total: number;
  userRank: {
    rank: number;
    score: ScoreData;
  } | null;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const nickname = localStorage.getItem("goat_nickname");
        const url = nickname
          ? `/api/scores?limit=100&nickname=${encodeURIComponent(nickname)}`
          : "/api/scores?limit=100";

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError("랭킹을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const myNickname =
    typeof window !== "undefined"
      ? localStorage.getItem("goat_nickname")
      : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 flex flex-col justify-center items-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-6 w-full max-w-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Ranking Board</h1>
          <button
            onClick={() => router.push("/")}
            className="pixel-ui bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          >
            Back
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl animate-bounce">🐐</div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* 랭킹 리스트 */}
        {data && !loading && (
          <>
            {/* 내 순위 (있을 경우) */}
            {data.userRank && (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-700 font-semibold">내 순위</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-2xl font-bold text-yellow-600">
                    #{data.userRank.rank}
                  </span>
                  <span className="text-lg font-mono">
                    {formatTime(data.userRank.score.clear_time)}
                  </span>
                </div>
              </div>
            )}

            {/* 랭킹 테이블 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.scores.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  아직 기록이 없습니다. 첫 번째 클리어를 노려보세요!
                </p>
              ) : (
                data.scores.map((score, index) => (
                  <div
                    key={score.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      score.nickname === myNickname
                        ? "bg-yellow-50 border-2 border-yellow-300"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* 순위 */}
                      <span
                        className={`w-8 text-center font-bold ${
                          index === 0
                            ? "text-yellow-500 text-xl"
                            : index === 1
                              ? "text-gray-400 text-lg"
                              : index === 2
                                ? "text-orange-400 text-lg"
                                : "text-gray-600"
                        }`}
                      >
                        {index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : index === 2
                              ? "🥉"
                              : `${index + 1}`}
                      </span>
                      {/* 닉네임 */}
                      <span className="font-medium text-gray-800">
                        {score.nickname}
                      </span>
                    </div>
                    {/* 시간 */}
                    <span className="font-mono text-gray-600">
                      {formatTime(score.clear_time)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* 총 기록 수 */}
            <p className="text-center text-gray-500 text-sm mt-4">
              총 {data.total}개의 기록
            </p>
          </>
        )}
      </div>
    </main>
  );
}
