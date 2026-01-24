import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { mapData } from '../utils/mapGenerator'
import { createPlatformBody, extractBodiesFromPlatform } from '../utils/platformFactory'
import { GAME_WIDTH, MAP_HEIGHT, GAME_CONSTANTS } from '../config'
import { PlatformData } from '@/types/game.d'

export default class GameScene extends Phaser.Scene {
  private player!: Player
  private platforms: Phaser.Physics.Matter.Image[] = []
  private goalPlatform: Phaser.Physics.Matter.Image | null = null
  private startTime!: number
  private timerText!: Phaser.GameObjects.Text
  private heightText!: Phaser.GameObjects.Text
  private powerGauge!: Phaser.GameObjects.Graphics
  private powerGaugeBackground!: Phaser.GameObjects.Graphics

  // 화면 크기 기반 스케일 팩터
  private scaleX: number = 1
  // 발판 원본 데이터 저장 (리사이즈 시 재계산용)
  private platformBodies: {
    body: Phaser.Physics.Matter.Image
    originalX: number
    originalWidth: number
  }[] = []
  // 씬 초기화 완료 플래그
  private isInitialized: boolean = false

  constructor() {
    super('GameScene')
  }

  create() {
    this.startTime = Date.now()

    // 스케일 팩터 계산 (기준 너비 960 대비)
    this.scaleX = this.scale.width / GAME_WIDTH

    // 배경색 설정
    this.cameras.main.setBackgroundColor('#87CEEB')

    // 맵 경계 설정 (실제 화면 너비 사용)
    this.matter.world.setBounds(0, 0, this.scale.width, MAP_HEIGHT)

    // 맵 생성
    this.createMap()

    // 플레이어 생성 (화면 중앙)
    this.player = new Player(this, this.scale.width / 2, 4900)

    // 카메라 설정
    this.cameras.main.startFollow(this.player, false, 0, GAME_CONSTANTS.CAMERA_LERP_Y)
    this.cameras.main.setBounds(0, 0, this.scale.width, MAP_HEIGHT)

    // HUD 생성
    this.createHUD()

    // 충돌 감지 설정
    this.setupCollisions()

    // 이벤트 리스너
    this.events.on('powerChanged', this.updatePowerGauge, this)
    this.events.on('jumpExecuted', this.hidePowerGauge, this)

    // 리사이즈 이벤트 핸들러
    this.scale.on('resize', this.handleResize, this)

    // 씬 종료 시 정리
    this.events.on('shutdown', this.cleanup, this)

    // 초기화 완료
    this.isInitialized = true
  }

  private cleanup() {
    this.isInitialized = false
    this.platformBodies = []
    this.scale.off('resize', this.handleResize, this)
    this.events.off('powerChanged', this.updatePowerGauge, this)
    this.events.off('jumpExecuted', this.hidePowerGauge, this)
  }

  update(time: number, delta: number) {
    this.player.update(delta)

    // HUD 업데이트
    this.updateHUD()

    // 클리어 체크
    if (this.player.isOnGoalPlatform) {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
      this.handleClear(elapsed)
    }
  }

  private createMap() {
    mapData.forEach((platform: PlatformData) => {
      // x 좌표와 너비를 화면 비율에 맞게 조정
      const scaledPlatform: PlatformData = {
        ...platform,
        x: platform.x * this.scaleX,
        width: platform.width ? platform.width * this.scaleX : undefined,
      }

      // platformFactory를 사용하여 발판 생성
      const platformObj = createPlatformBody(this, scaledPlatform)

      // 생성된 발판에서 물리 바디 추출
      const bodies = extractBodiesFromPlatform(platformObj)

      // 원본 좌표와 너비 저장 (리사이즈 시 재계산용)
      // 각 바디의 실제 displayWidth를 사용 (경사면의 각 파트별 너비가 다름)
      bodies.forEach((body) => {
        this.platformBodies.push({
          body,
          originalX: body.x / this.scaleX,
          originalWidth: body.displayWidth / this.scaleX,
        })
      })

      // 골인 발판 표시
      if (platform.isGoal) {
        bodies.forEach((body) => {
          body.setData('isGoal', true)
        })
        if (bodies.length > 0) {
          this.goalPlatform = bodies[0]
        }
      }

      // platforms 배열에 추가 (충돌 감지용)
      this.platforms.push(...bodies)
    })
  }

  private createHUD() {
    // 타이머
    this.timerText = this.add
      .text(16, 16, 'TIME: 00:00', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100)

    // 높이
    this.heightText = this.add
      .text(16, 46, 'HEIGHT: 0m', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100)

    // 파워 게이지 배경
    this.powerGaugeBackground = this.add.graphics()
    this.powerGaugeBackground.setScrollFactor(0)
    this.powerGaugeBackground.setDepth(100)
    this.powerGaugeBackground.setVisible(false)

    // 파워 게이지
    this.powerGauge = this.add.graphics()
    this.powerGauge.setScrollFactor(0)
    this.powerGauge.setDepth(101)
    this.powerGauge.setVisible(false)
  }

  private updateHUD() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    this.timerText.setText(
      `TIME: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    )
    this.heightText.setText(`HEIGHT: ${this.player.getHeight()}m`)
  }

  private updatePowerGauge(power: number) {
    // 게이지 표시
    this.powerGaugeBackground.setVisible(true)
    this.powerGauge.setVisible(true)

    // 현재 화면 크기 가져오기 (RESIZE 모드에서 동적으로 변함)
    const screenWidth = this.scale.width
    const screenHeight = this.scale.height

    // 배경 그리기 (화면 하단 중앙)
    this.powerGaugeBackground.clear()
    this.powerGaugeBackground.fillStyle(0x333333, 0.8)
    this.powerGaugeBackground.fillRect(screenWidth / 2 - 100, screenHeight - 40, 200, 20)

    // 게이지 그리기
    this.powerGauge.clear()
    const gaugeWidth = 196 * power
    const color = power < 0.5 ? 0x00ff00 : power < 0.8 ? 0xffff00 : 0xff0000
    this.powerGauge.fillStyle(color, 1)
    this.powerGauge.fillRect(screenWidth / 2 - 98, screenHeight - 38, gaugeWidth, 16)
  }

  private hidePowerGauge() {
    this.powerGaugeBackground.setVisible(false)
    this.powerGauge.setVisible(false)
  }

  private setupCollisions() {
    // 현재 충돌 중인 발판 추적
    let collidingPlatforms = new Set<Phaser.Physics.Matter.Image>()

    // 충돌 시작 이벤트
    this.matter.world.on(
      'collisionstart',
      (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA
          const bodyB = pair.bodyB

          const playerBody = this.player.body as MatterJS.BodyType
          if (bodyA === playerBody || bodyB === playerBody) {
            const otherBody = bodyA === playerBody ? bodyB : bodyA
            const platform = this.platforms.find(
              (p) => (p.body as MatterJS.BodyType) === otherBody
            )

            if (platform) {
              collidingPlatforms.add(platform)
              const isGoal = platform.getData('isGoal') === true
              this.player.setGrounded(true, isGoal)
            }
          }
        })
      }
    )

    // 지속 충돌 이벤트 - 착지 상태 유지
    this.matter.world.on(
      'collisionactive',
      (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
        let isOnGoal = false

        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA
          const bodyB = pair.bodyB

          const playerBody = this.player.body as MatterJS.BodyType
          if (bodyA === playerBody || bodyB === playerBody) {
            const otherBody = bodyA === playerBody ? bodyB : bodyA
            const platform = this.platforms.find(
              (p) => (p.body as MatterJS.BodyType) === otherBody
            )

            if (platform) {
              collidingPlatforms.add(platform)
              if (platform.getData('isGoal') === true) {
                isOnGoal = true
              }
            }
          }
        })

        // 충돌 중인 발판이 있으면 착지 상태 유지
        if (collidingPlatforms.size > 0) {
          this.player.setGrounded(true, isOnGoal)
        }
      }
    )

    // 충돌 종료 이벤트
    this.matter.world.on(
      'collisionend',
      (event: Phaser.Physics.Matter.Events.CollisionEndEvent) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA
          const bodyB = pair.bodyB

          const playerBody = this.player.body as MatterJS.BodyType
          if (bodyA === playerBody || bodyB === playerBody) {
            const otherBody = bodyA === playerBody ? bodyB : bodyA
            const platform = this.platforms.find(
              (p) => (p.body as MatterJS.BodyType) === otherBody
            )

            if (platform) {
              collidingPlatforms.delete(platform)
            }
          }
        })

        // 충돌 중인 발판이 없으면 공중 상태
        if (collidingPlatforms.size === 0) {
          this.player.setGrounded(false, false)
        }
      }
    )
  }

  private handleClear(clearTime: number) {
    this.scene.pause()
    this.scene.launch('GameOverScene', {
      success: true,
      clearTime,
      height: this.player.getHeight(),
    })
  }

  // 게임오버 처리 (표범 충돌 시 호출)
  handleGameOver() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
    this.scene.pause()
    this.scene.launch('GameOverScene', {
      success: false,
      clearTime: elapsed,
      height: this.player.getHeight(),
    })
  }

  // 리사이즈 핸들러
  private handleResize(gameSize: Phaser.Structs.Size) {
    // 초기화 완료 전에는 무시
    if (!this.isInitialized) return

    const width = gameSize.width

    // 새 스케일 팩터 계산
    const newScaleX = width / GAME_WIDTH
    const scaleRatio = newScaleX / this.scaleX

    // 스케일 팩터 업데이트
    this.scaleX = newScaleX

    // 월드 경계 업데이트
    this.matter.world.setBounds(0, 0, width, MAP_HEIGHT)

    // 카메라 경계 업데이트
    this.cameras.main.setBounds(0, 0, width, MAP_HEIGHT)

    // 발판 위치와 크기 업데이트
    this.platformBodies.forEach(({ body, originalX, originalWidth }) => {
      const newX = originalX * this.scaleX
      const newWidth = originalWidth * this.scaleX
      body.setPosition(newX, body.y)
      body.setDisplaySize(newWidth, body.displayHeight)
    })

    // 플레이어 x 위치도 비율에 맞게 조정
    if (this.player) {
      this.player.setPosition(this.player.x * scaleRatio, this.player.y)
    }
  }
}
