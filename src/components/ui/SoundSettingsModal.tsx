"use client";

import { useAudioStore } from "@/store/audioStore";

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SoundSettingsModal({
  isOpen,
  onClose,
}: SoundSettingsModalProps) {
  const {
    bgmVolume,
    sfxVolume,
    bgmMuted,
    sfxMuted,
    setBgmVolume,
    setSfxVolume,
    toggleBgmMute,
    toggleSfxMute,
  } = useAudioStore();

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
        <h2 className="text-2xl font-bold mb-6 text-gray-700">SOUND</h2>

        {/* BGM */}
        <div className="mb-5 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">BGM</span>
            <button
              onClick={toggleBgmMute}
              className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                bgmMuted
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white"
              }`}
            >
              {bgmMuted ? "OFF" : "ON"}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={bgmMuted ? 0 : bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              disabled={bgmMuted}
              className="pixel-slider w-full"
            />
            <span className="text-xs font-bold text-gray-500 w-10 text-right">
              {bgmMuted ? 0 : Math.round(bgmVolume * 100)}%
            </span>
          </div>
        </div>

        {/* SFX */}
        <div className="mb-6 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">Effect</span>
            <button
              onClick={toggleSfxMute}
              className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                sfxMuted
                  ? "bg-gray-300 text-gray-500"
                  : "bg-green-500 text-white"
              }`}
            >
              {sfxMuted ? "OFF" : "ON"}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={sfxMuted ? 0 : sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              disabled={sfxMuted}
              className="pixel-slider w-full"
            />
            <span className="text-xs font-bold text-gray-500 w-10 text-right">
              {sfxMuted ? 0 : Math.round(sfxVolume * 100)}%
            </span>
          </div>
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
