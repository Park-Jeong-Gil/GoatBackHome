import { create } from "zustand";

interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  bgmMuted: boolean;
  sfxMuted: boolean;
}

interface AudioStore extends AudioSettings {
  isSettingsOpen: boolean;

  setBgmVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleBgmMute: () => void;
  toggleSfxMute: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  initFromStorage: () => void;
}

const STORAGE_KEY = "goat_audio_settings";

function dispatchToPhaser(detail: Partial<AudioSettings>) {
  window.dispatchEvent(new CustomEvent("audioSettingsChanged", { detail }));
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  bgmVolume: 0.5,
  sfxVolume: 0.5,
  bgmMuted: false,
  sfxMuted: false,
  isSettingsOpen: false,

  setBgmVolume: (volume) => {
    set({ bgmVolume: volume });
    dispatchToPhaser({ bgmVolume: volume });
  },

  setSfxVolume: (volume) => {
    set({ sfxVolume: volume });
    dispatchToPhaser({ sfxVolume: volume });
  },

  toggleBgmMute: () => {
    const muted = !get().bgmMuted;
    set({ bgmMuted: muted });
    dispatchToPhaser({ bgmMuted: muted });
  },

  toggleSfxMute: () => {
    const muted = !get().sfxMuted;
    set({ sfxMuted: muted });
    dispatchToPhaser({ sfxMuted: muted });
  },

  openSettings: () => {
    set({ isSettingsOpen: true });
    window.dispatchEvent(new CustomEvent("gamePauseRequest"));
  },

  closeSettings: () => {
    set({ isSettingsOpen: false });
    window.dispatchEvent(new CustomEvent("gameResumeRequest"));
  },

  initFromStorage: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AudioSettings>;
        set({
          bgmVolume: parsed.bgmVolume ?? 0.5,
          sfxVolume: parsed.sfxVolume ?? 0.7,
          bgmMuted: parsed.bgmMuted ?? false,
          sfxMuted: parsed.sfxMuted ?? false,
        });
      }
    } catch {
      // localStorage 접근 불가 시 기본값 유지
    }
  },
}));
