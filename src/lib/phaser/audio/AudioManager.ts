import Phaser from "phaser";

interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  bgmMuted: boolean;
  sfxMuted: boolean;
}

const STORAGE_KEY = "goat_audio_settings";

const DEFAULT_SETTINGS: AudioSettings = {
  bgmVolume: 0.5,
  sfxVolume: 0.5,
  bgmMuted: false,
  sfxMuted: false,
};

export class AudioManager {
  private static instance: AudioManager | null = null;
  private soundManager: Phaser.Sound.BaseSoundManager | null = null;

  private bgmVolume: number = DEFAULT_SETTINGS.bgmVolume;
  private sfxVolume: number = DEFAULT_SETTINGS.sfxVolume;
  private bgmMuted: boolean = DEFAULT_SETTINGS.bgmMuted;
  private sfxMuted: boolean = DEFAULT_SETTINGS.sfxMuted;

  private currentBgm: Phaser.Sound.BaseSound | null = null;
  private loopingSfxSet: Set<Phaser.Sound.BaseSound> = new Set();

  private handleSettingsChanged: ((e: Event) => void) | null = null;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  init(soundManager: Phaser.Sound.BaseSoundManager): void {
    this.soundManager = soundManager;

    // 이전 참조 정리 (씬 재시작 시)
    this.currentBgm = null;
    this.loopingSfxSet.clear();

    // React 이벤트 리스너 등록 (중복 방지)
    if (this.handleSettingsChanged) {
      window.removeEventListener(
        "audioSettingsChanged",
        this.handleSettingsChanged,
      );
    }
    this.handleSettingsChanged = (e: Event) => {
      const detail = (e as CustomEvent<Partial<AudioSettings>>).detail;
      this.applySettings(detail);
    };
    window.addEventListener("audioSettingsChanged", this.handleSettingsChanged);
  }

  playSfx(key: string): void {
    if (this.sfxMuted || !this.soundManager) return;
    this.soundManager.play(key, { volume: this.sfxVolume });
  }

  playBgm(key: string): void {
    if (!this.soundManager) return;

    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm.destroy();
    }

    this.currentBgm = this.soundManager.add(key, {
      loop: true,
      volume: this.bgmMuted ? 0 : this.bgmVolume,
    });
    this.currentBgm.play();
  }

  createLoopingSfx(key: string): Phaser.Sound.BaseSound {
    if (!this.soundManager) {
      throw new Error("AudioManager not initialized");
    }

    const sound = this.soundManager.add(key, {
      loop: true,
      volume: this.sfxMuted ? 0 : this.sfxVolume,
    });

    this.loopingSfxSet.add(sound);
    return sound;
  }

  removeLoopingSfx(sound: Phaser.Sound.BaseSound): void {
    this.loopingSfxSet.delete(sound);
  }

  setBgmVolume(volume: number): void {
    this.bgmVolume = volume;
    if (this.currentBgm) {
      (this.currentBgm as Phaser.Sound.WebAudioSound).setVolume(
        this.bgmMuted ? 0 : volume,
      );
    }
    this.saveSettings();
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = volume;
    // 등록된 모든 루프 SFX 볼륨 업데이트 (재생 여부 무관)
    this.loopingSfxSet.forEach((sound) => {
      (sound as Phaser.Sound.WebAudioSound).setVolume(
        this.sfxMuted ? 0 : volume,
      );
    });
    this.saveSettings();
  }

  setBgmMuted(muted: boolean): void {
    this.bgmMuted = muted;
    if (this.currentBgm) {
      (this.currentBgm as Phaser.Sound.WebAudioSound).setVolume(
        muted ? 0 : this.bgmVolume,
      );
    }
    this.saveSettings();
  }

  setSfxMuted(muted: boolean): void {
    this.sfxMuted = muted;
    // 등록된 모든 루프 SFX 뮤트 상태 업데이트 (재생 여부 무관)
    this.loopingSfxSet.forEach((sound) => {
      (sound as Phaser.Sound.WebAudioSound).setVolume(
        muted ? 0 : this.sfxVolume,
      );
    });
    this.saveSettings();
  }

  isSfxMuted(): boolean {
    return this.sfxMuted;
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  getSettings(): AudioSettings {
    return {
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
      bgmMuted: this.bgmMuted,
      sfxMuted: this.sfxMuted,
    };
  }

  private applySettings(settings: Partial<AudioSettings>): void {
    if (settings.bgmVolume !== undefined) this.setBgmVolume(settings.bgmVolume);
    if (settings.sfxVolume !== undefined) this.setSfxVolume(settings.sfxVolume);
    if (settings.bgmMuted !== undefined) this.setBgmMuted(settings.bgmMuted);
    if (settings.sfxMuted !== undefined) this.setSfxMuted(settings.sfxMuted);
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AudioSettings>;
        this.bgmVolume = parsed.bgmVolume ?? DEFAULT_SETTINGS.bgmVolume;
        this.sfxVolume = parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume;
        this.bgmMuted = parsed.bgmMuted ?? DEFAULT_SETTINGS.bgmMuted;
        this.sfxMuted = parsed.sfxMuted ?? DEFAULT_SETTINGS.sfxMuted;
      }
    } catch {
      // localStorage 접근 불가 시 기본값 사용
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          bgmVolume: this.bgmVolume,
          sfxVolume: this.sfxVolume,
          bgmMuted: this.bgmMuted,
          sfxMuted: this.sfxMuted,
        }),
      );
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }

  stopAll(): void {
    if (this.soundManager) {
      this.soundManager.stopAll();
    }
    this.currentBgm = null;
    this.loopingSfxSet.clear();
  }
}
