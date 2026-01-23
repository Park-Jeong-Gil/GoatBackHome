import { create } from 'zustand'

interface GameStore {
  // 플레이어 정보
  nickname: string
  setNickname: (nickname: string) => void

  // 게임 상태
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void

  // 게임 데이터
  currentHeight: number
  setCurrentHeight: (height: number) => void

  elapsedTime: number
  setElapsedTime: (time: number) => void

  // 점프 파워 (UI 동기화용)
  jumpPower: number
  setJumpPower: (power: number) => void

  // 게임 결과
  lastClearTime: number | null
  setLastClearTime: (time: number | null) => void

  // 리셋
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  // 플레이어 정보
  nickname: '',
  setNickname: (nickname) => set({ nickname }),

  // 게임 상태
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  // 게임 데이터
  currentHeight: 0,
  setCurrentHeight: (currentHeight) => set({ currentHeight }),

  elapsedTime: 0,
  setElapsedTime: (elapsedTime) => set({ elapsedTime }),

  // 점프 파워
  jumpPower: 0,
  setJumpPower: (jumpPower) => set({ jumpPower }),

  // 게임 결과
  lastClearTime: null,
  setLastClearTime: (lastClearTime) => set({ lastClearTime }),

  // 리셋
  resetGame: () =>
    set({
      isPlaying: false,
      currentHeight: 0,
      elapsedTime: 0,
      jumpPower: 0,
      lastClearTime: null,
    }),
}))
