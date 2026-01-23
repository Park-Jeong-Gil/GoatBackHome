import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../config'

interface GameOverData {
  success: boolean
  clearTime: number
  height: number
}

export default class GameOverScene extends Phaser.Scene {
  private gameResult!: GameOverData

  constructor() {
    super('GameOverScene')
  }

  init(data: GameOverData) {
    this.gameResult = data
  }

  create() {
    // 반투명 배경
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.7
    )

    // 제목
    const titleText = this.gameResult.success ? 'GOAL REACHED!' : 'GAME OVER'
    const titleColor = this.gameResult.success ? '#FFD700' : '#FF4444'

    this.add
      .text(GAME_WIDTH / 2, 150, titleText, {
        fontSize: '48px',
        color: titleColor,
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    // 클리어 시간
    const minutes = Math.floor(this.gameResult.clearTime / 60)
    const seconds = this.gameResult.clearTime % 60
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    if (this.gameResult.success) {
      this.add
        .text(GAME_WIDTH / 2, 230, `Clear Time: ${timeStr}`, {
          fontSize: '24px',
          color: '#ffffff',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
    }

    // 최대 높이
    this.add
      .text(GAME_WIDTH / 2, 270, `Best Height: ${this.gameResult.height}m`, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    // 버튼들
    this.createButton(GAME_WIDTH / 2, 380, 'PLAY AGAIN', () => {
      this.scene.stop()
      this.scene.stop('GameScene')
      this.scene.start('GameScene')
    })

    this.createButton(GAME_WIDTH / 2, 440, 'MAIN MENU', () => {
      this.scene.stop()
      this.scene.stop('GameScene')
      // Next.js 라우터로 메인 메뉴 이동
      window.location.href = '/'
    })

    // 클리어 시 점수 저장 시도
    if (this.gameResult.success) {
      this.saveScore()
    }
  }

  private createButton(x: number, y: number, text: string, onClick: () => void) {
    const button = this.add
      .text(x, y, text, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'monospace',
        backgroundColor: '#444444',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: '#666666' })
    })

    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: '#444444' })
    })

    button.on('pointerdown', onClick)
  }

  private async saveScore() {
    try {
      // localStorage에서 닉네임 가져오기
      const nickname = localStorage.getItem('goat_nickname') || 'Anonymous'

      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname,
          clear_time: this.gameResult.clearTime,
          max_height: this.gameResult.height,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Score saved, rank:', result.rank)

        // 랭크 표시
        if (result.rank) {
          this.add
            .text(GAME_WIDTH / 2, 320, `RANK #${result.rank}`, {
              fontSize: '32px',
              color: '#FFD700',
              fontFamily: 'monospace',
              stroke: '#000000',
              strokeThickness: 3,
            })
            .setOrigin(0.5)
        }
      }
    } catch (error) {
      console.error('Failed to save score:', error)
    }
  }
}
