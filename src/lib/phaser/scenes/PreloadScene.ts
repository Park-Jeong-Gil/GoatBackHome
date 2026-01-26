import Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    // 로딩 바 표시
    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()

    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // 동적 위치 계산
    const barWidth = 320
    const barHeight = 50
    const barX = (width - barWidth) / 2
    const barY = (height - barHeight) / 2

    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(barX, barY, barWidth, barHeight)

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    })
    loadingText.setOrigin(0.5, 0.5)

    // 로딩 진행률 표시
    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(barX + 10, barY + 10, (barWidth - 20) * value, barHeight - 20)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
    })

    // 임시 플레이스홀더 에셋 생성 (나중에 실제 에셋으로 교체)
    this.createPlaceholderAssets()

    // 배경 이미지 로드
    this.load.image('mountains', '/assets/backgrounds/mountains.webp')

    // 실제 에셋 로드 (파일이 있을 때 주석 해제)
    // this.load.image('goat_idle', '/assets/sprites/goat_idle.png')
    // this.load.image('goat_jump', '/assets/sprites/goat_jump.png')
    // this.load.image('goat_fall', '/assets/sprites/goat_fall.png')
    // this.load.image('platform', '/assets/tiles/platform_normal.png')
    // this.load.image('platform_ice', '/assets/tiles/platform_ice.png')
    // this.load.image('platform_tilted', '/assets/tiles/platform_tilted.png')
    // this.load.image('bird', '/assets/obstacles/bird.png')
    // this.load.image('leopard', '/assets/obstacles/leopard.png')
    // this.load.image('trees', '/assets/backgrounds/trees.png')
    // this.load.audio('jump', '/assets/sounds/jump.mp3')
    // this.load.audio('land', '/assets/sounds/land.mp3')
  }

  create() {
    this.scene.start('GameScene')
  }

  private createPlaceholderAssets() {
    // 플레이어 플레이스홀더 (64x64 흰색 사각형)
    const playerGraphics = this.make.graphics({ x: 0, y: 0 })
    playerGraphics.fillStyle(0xffffff, 1)
    playerGraphics.fillRect(0, 0, 64, 64)
    playerGraphics.generateTexture('goat', 64, 64)
    playerGraphics.destroy()

    // 발판 플레이스홀더 (64x16 갈색 사각형)
    const platformGraphics = this.make.graphics({ x: 0, y: 0 })
    platformGraphics.fillStyle(0x8b4513, 1)
    platformGraphics.fillRect(0, 0, 64, 16)
    platformGraphics.generateTexture('platform', 64, 16)
    platformGraphics.destroy()

    // 얼음 발판 플레이스홀더 (64x16 진한 파란색 + 반투명 효과)
    const iceGraphics = this.make.graphics({ x: 0, y: 0 })
    // 진한 파란색 배경
    iceGraphics.fillStyle(0x2196f3, 1)
    iceGraphics.fillRect(0, 0, 64, 16)
    // 반짝이는 하이라이트 추가
    iceGraphics.fillStyle(0x64b5f6, 0.7)
    iceGraphics.fillRect(2, 2, 60, 4)
    iceGraphics.fillStyle(0xbbdefb, 0.5)
    iceGraphics.fillRect(4, 4, 20, 2)
    iceGraphics.fillRect(30, 4, 15, 2)
    iceGraphics.generateTexture('platform_ice', 64, 16)
    iceGraphics.destroy()

    // 기울어진 발판 플레이스홀더
    const tiltedGraphics = this.make.graphics({ x: 0, y: 0 })
    tiltedGraphics.fillStyle(0x654321, 1)
    tiltedGraphics.fillRect(0, 0, 64, 16)
    tiltedGraphics.generateTexture('platform_tilted', 64, 16)
    tiltedGraphics.destroy()

    // 새 플레이스홀더 (48x48 빨간 사각형)
    const birdGraphics = this.make.graphics({ x: 0, y: 0 })
    birdGraphics.fillStyle(0xff0000, 1)
    birdGraphics.fillRect(0, 0, 48, 48)
    birdGraphics.generateTexture('bird', 48, 48)
    birdGraphics.destroy()

    // 표범 플레이스홀더 (96x64 주황색 사각형)
    const leopardGraphics = this.make.graphics({ x: 0, y: 0 })
    leopardGraphics.fillStyle(0xffa500, 1)
    leopardGraphics.fillRect(0, 0, 96, 64)
    leopardGraphics.generateTexture('leopard', 96, 64)
    leopardGraphics.destroy()

    // 골인 발판 플레이스홀더 (금색)
    const goalGraphics = this.make.graphics({ x: 0, y: 0 })
    goalGraphics.fillStyle(0xffd700, 1)
    goalGraphics.fillRect(0, 0, 300, 16)
    goalGraphics.generateTexture('platform_goal', 300, 16)
    goalGraphics.destroy()
  }
}
