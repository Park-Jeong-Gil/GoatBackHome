"use client";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({
  isOpen,
  onClose,
}: HowToPlayModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-700">HOW TO PLAY</h2>

        <div className="text-left text-gray-700 space-y-3 text-sm mb-6">
          <div>
            <p className="font-bold mb-1">조작법</p>
            <p>⬅️➡️ : 점프 방향</p>
            <p>SPACE or ⬆️ : 점프 (길게 누르면 차징)</p>
          </div>

          <div>
            <p className="font-bold mb-1">목표</p>
            <p>
              방향키를 누른채 점프를 해야 방향대로 이동합니다.
              <br />
              오직 점프만으로 정상까지 이동하세요!
            </p>
          </div>

          <div>
            <p className="font-bold text-red-500 mb-1">주의</p>
            <p>표범에게 잡히면 게임오버!</p>
          </div>

          <p className="text-xs text-gray-400 pt-2">
            ※ 이 게임은 Nexile의 'Jump King'에서 영감을 받았습니다.
          </p>
        </div>

        <button
          onClick={onClose}
          className="pixel-ui w-full py-3 text-white text-lg font-semibold bg-[#939393] transition-colors hover:bg-[#7a7a7a]"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
