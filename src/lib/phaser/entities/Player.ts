import Phaser from 'phaser'
import { GAME_CONSTANTS, MAP_HEIGHT, COLLISION_CATEGORIES, COLLISION_MASKS } from '../config'

// 플레이어 상태 enum
export enum PlayerState {
  IDLE = 'idle',           // 가만히 있는 상태
  CHARGING = 'charging',   // 점프를 준비하는 상태 (점프 키가 눌린 상태)
  JUMPING = 'jumping',     // 위로 점프 중인 상태
  FALLING = 'falling',     // 아래로 떨어지는 중인 상태
  LANDED = 'landed',       // 지면에 착지한 상태 (짧은 시간 동안만 유지)
}

export class Player extends Phaser.Physics.Matter.Sprite {
  private jumpPower: number = 0
  private isCharging: boolean = false
  private maxPower: number = GAME_CONSTANTS.MAX_JUMP_POWER
  public isGrounded: boolean = false
  public isOnGoalPlatform: boolean = false

  // 상태 관리
  private _state: PlayerState = PlayerState.IDLE
  private landedTimer: number = 0
  private readonly LANDED_DURATION: number = 150 // 착지 상태 지속 시간 (ms)

  // 화면 비율 (점프 수평 이동에 적용)
  private screenScaleX: number = 1

  // 가상 컨트롤러 입력 (모바일용)
  private virtualDirection: number = 0 // -1: 왼쪽, 0: 없음, 1: 오른쪽

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private spaceKey!: Phaser.Input.Keyboard.Key

  constructor(scene: Phaser.Scene, x: number, y: number, scaleX: number = 1) {
    super(scene.matter.world, x, y, 'goat')

    this.screenScaleX = scaleX
    scene.add.existing(this)

    // 물리 설정
    this.setFriction(GAME_CONSTANTS.PLAYER_FRICTION)
    this.setBounce(GAME_CONSTANTS.PLAYER_BOUNCE)

    // 충돌 바디 크기 조정 (스프라이트보다 약간 작게)
    this.setBody({
      type: 'rectangle',
      width: 56,
      height: 56,
    })

    // 회전 완전 방지
    this.setFixedRotation()

    this.setFrictionAir(0.01)

    // 충돌 카테고리 설정 - 발판과 새 모두와 충돌
    this.setCollisionCategory(COLLISION_CATEGORIES.PLAYER)
    this.setCollidesWith(COLLISION_MASKS.PLAYER)

    // 입력 설정
    this.setupInput()
  }

  private setupInput() {
    if (!this.scene.input.keyboard) return

    this.cursors = this.scene.input.keyboard.createCursorKeys()
    this.spaceKey = this.scene.input.keyboard.addKey('SPACE')

    // 점프 차징
    this.spaceKey.on('down', () => {
      if (this.isGrounded) {
        this.isCharging = true
      }
    })

    this.spaceKey.on('up', () => {
      if (this.isCharging) {
        this.jump()
        this.isCharging = false
        this.jumpPower = 0
      }
    })
  }

  // 현재 방향키 상태 확인 (키보드 + 가상 컨트롤러)
  private getDirection(): number {
    // 가상 컨트롤러 입력 우선
    if (this.virtualDirection !== 0) return this.virtualDirection
    // 키보드 입력
    if (!this.cursors) return 0
    if (this.cursors.left.isDown) return -1
    if (this.cursors.right.isDown) return 1
    return 0
  }

  // 가상 컨트롤러: 방향 설정
  setVirtualDirection(direction: number) {
    this.virtualDirection = direction
  }

  // 가상 컨트롤러: 점프 시작 (차징)
  startCharging() {
    if (this.isGrounded) {
      this.isCharging = true
    }
  }

  // 가상 컨트롤러: 점프 실행
  releaseJump() {
    if (this.isCharging) {
      this.jump()
      this.isCharging = false
      this.jumpPower = 0
    }
  }

  update(delta: number) {
    // 차징 중 파워 증가
    if (this.isCharging && this.isGrounded) {
      this.jumpPower = Math.min(
        this.jumpPower + (GAME_CONSTANTS.CHARGE_RATE * delta) / 1000,
        this.maxPower
      )

      // 파워 게이지 이벤트 발생 (0-1 범위)
      this.scene.events.emit('powerChanged', this.jumpPower / this.maxPower)
    }

    // 상태 업데이트
    this.updateState(delta)
  }

  private updateState(delta: number) {
    const velocity = this.body?.velocity as Phaser.Math.Vector2
    const prevState = this._state

    // LANDED 상태 타이머 처리
    if (this._state === PlayerState.LANDED) {
      this.landedTimer -= delta
      if (this.landedTimer <= 0) {
        this._state = PlayerState.IDLE
      }
      return
    }

    // 상태 결정
    if (this.isGrounded) {
      if (this.isCharging) {
        this._state = PlayerState.CHARGING
      } else {
        this._state = PlayerState.IDLE
      }
    } else if (velocity) {
      if (velocity.y < -0.5) {
        this._state = PlayerState.JUMPING
      } else if (velocity.y > 0.5) {
        this._state = PlayerState.FALLING
      }
      // velocity.y가 -0.5 ~ 0.5 사이면 이전 상태 유지
    }

    // 상태 변경 시 이벤트 발생
    if (prevState !== this._state) {
      this.scene.events.emit('playerStateChanged', this._state, prevState)
    }
  }

  private jump() {
    if (!this.isGrounded) return

    // 현재 x 속도 (미끄러지는 중이면 유지)
    const currentVelocity = this.body?.velocity as Phaser.Math.Vector2
    const currentVelX = currentVelocity?.x || 0

    // 점프 시점에 방향키 상태 확인
    const direction = this.getDirection()
    const power = this.jumpPower
    // 모바일(scaleX <= 1)은 화면 비율 적용, PC(scaleX > 1)는 고정 폭 사용
    const horizontalScale = this.screenScaleX <= 1 ? this.screenScaleX : 1
    const inputDirX = direction * GAME_CONSTANTS.HORIZONTAL_JUMP_RATIO * power * horizontalScale
    // PC에서는 점프 높이를 20% 증가
    const verticalScale = this.screenScaleX > 1 ? 1.2 : 1
    const dirY = -power * verticalScale

    // 기존 x 속도 + 방향키 입력 (미끄러지면서 점프 가능)
    const finalDirX = currentVelX * 0.7 + inputDirX

    this.setVelocity(finalDirX, dirY)
    this.isGrounded = false
    this._state = PlayerState.JUMPING

    // 점프 실행 이벤트
    this.scene.events.emit('jumpExecuted')
  }

  getHeight(): number {
    // 시작 지점 대비 높이 (m 단위)
    const startY = MAP_HEIGHT
    return Math.max(0, Math.round((startY - this.y) / 10))
  }

  getJumpPower(): number {
    return this.jumpPower
  }

  getMaxPower(): number {
    return this.maxPower
  }

  isCurrentlyCharging(): boolean {
    return this.isCharging
  }

  // 현재 플레이어 상태 반환
  getState(): PlayerState {
    return this._state
  }

  setGrounded(grounded: boolean, isGoal: boolean = false) {
    const wasInAir = !this.isGrounded
    this.isGrounded = grounded
    this.isOnGoalPlatform = isGoal

    // 공중에서 착지했을 때 LANDED 상태로 전환
    if (grounded && wasInAir) {
      this._state = PlayerState.LANDED
      this.landedTimer = this.LANDED_DURATION
      this.scene.events.emit('playerStateChanged', PlayerState.LANDED, PlayerState.FALLING)
    }
  }

  // 넉백 (새에게 맞았을 때)
  applyKnockback(directionX: number, force: number) {
    this.setVelocity(directionX * force, -force * 0.5)
    this.isGrounded = false
    this._state = PlayerState.FALLING
  }

  // 힘 적용 (얼음 미끄러짐 등)
  applySlideForce(force: Phaser.Math.Vector2) {
    const body = this.body as MatterJS.BodyType
    if (body) {
      this.scene.matter.body.applyForce(body, body.position, {
        x: force.x,
        y: force.y,
      })
    }
  }

  // 화면 비율 업데이트 (리사이즈 시)
  setScreenScaleX(scaleX: number) {
    this.screenScaleX = scaleX
  }

  // 마찰력 동적 변경 (얼음 발판용)
  setFrictionValue(friction: number) {
    this.setFriction(friction)
  }

  // 기본 마찰력으로 복원
  resetFriction() {
    this.setFriction(GAME_CONSTANTS.PLAYER_FRICTION)
  }
}
