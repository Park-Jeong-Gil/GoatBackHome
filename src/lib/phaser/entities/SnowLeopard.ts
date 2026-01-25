import Phaser from 'phaser'
import { COLLISION_CATEGORIES, COLLISION_MASKS, GAME_CONSTANTS } from '../config'

// 설표 데이터 타입
export interface SnowLeopardData {
  platformIndex: number  // 스폰되는 발판 인덱스
  x: number              // 발판 위 x 위치
  y: number              // 발판 위 y 위치
  detectRange?: number   // 감지 범위 (기본: LEOPARD_DETECT_RANGE)
  speed?: number         // 이동 속도 (기본: LEOPARD_SPEED)
}

// 설표 상태
export enum SnowLeopardState {
  IDLE = 'idle',         // 대기 상태
  CHARGING = 'charging', // 돌진 상태 (발판 위에서 추적)
  FALLING = 'falling',   // 떨어지는 상태 (공중)
  DEAD = 'dead',         // 사라진 상태 (맵 바닥 추락)
}

export class SnowLeopard extends Phaser.Physics.Matter.Sprite {
  private spawnX: number
  private spawnY: number
  private spawnPlatformIndex: number
  private detectRange: number
  private baseSpeed: number // 기본 속도 (스케일 적용 전)
  private moveSpeed: number // 실제 이동 속도 (스케일 적용 후)
  private _state: SnowLeopardState = SnowLeopardState.IDLE
  private isOnSpawnPlatform: boolean = true
  private direction: number = 0 // 1: 오른쪽, -1: 왼쪽, 0: 정지
  private playerRef: Phaser.Physics.Matter.Sprite | null = null
  private screenScaleX: number = 1 // 화면 비율

  constructor(scene: Phaser.Scene, data: SnowLeopardData, scaleX: number = 1) {
    // 설표 텍스처 사용 (없으면 placeholder로 goat 사용)
    super(scene.matter.world, data.x, data.y, 'leopard')

    this.screenScaleX = scaleX
    this.spawnX = data.x
    this.spawnY = data.y
    this.spawnPlatformIndex = data.platformIndex
    this.detectRange = data.detectRange || GAME_CONSTANTS.LEOPARD_DETECT_RANGE
    this.baseSpeed = data.speed || GAME_CONSTANTS.LEOPARD_SPEED
    this.moveSpeed = this.baseSpeed * this.screenScaleX

    scene.add.existing(this)

    // 물리 바디 설정 - 플레이어와 동일한 설정
    this.setBody({
      type: 'rectangle',
      width: 28,
      height: 28,
    })

    // 플레이어와 동일한 물리 특성
    this.setFriction(GAME_CONSTANTS.PLAYER_FRICTION)
    this.setBounce(GAME_CONSTANTS.PLAYER_BOUNCE)
    this.setFixedRotation()
    this.setFrictionAir(0.01)

    // 충돌 카테고리 설정 - 플레이어와 발판 모두와 충돌
    this.setCollisionCategory(COLLISION_CATEGORIES.LEOPARD)
    this.setCollidesWith(COLLISION_MASKS.LEOPARD)

    // 라벨 설정 (충돌 감지용)
    const body = this.body as MatterJS.BodyType
    if (body) {
      body.label = 'leopard'
    }

    // 시각적 구분을 위해 약간의 틴트 적용 (옵션)
    this.setTint(0xaaaaaa)
  }

  // 플레이어 참조 설정
  setPlayerRef(player: Phaser.Physics.Matter.Sprite) {
    this.playerRef = player
  }

  update() {
    if (this._state === SnowLeopardState.DEAD) {
      return
    }

    if (!this.playerRef) return

    const playerX = this.playerRef.x
    const playerY = this.playerRef.y

    // 상태에 따른 업데이트
    switch (this._state) {
      case SnowLeopardState.IDLE:
        this.updateIdle(playerX, playerY)
        break
      case SnowLeopardState.CHARGING:
        this.updateCharging()
        break
      case SnowLeopardState.FALLING:
        this.updateFalling()
        break
    }
  }

  private updateIdle(playerX: number, playerY: number) {
    // 플레이어가 감지 범위 내에 있고, 설표와 비슷한 높이(±50)에 있으면 돌진 시작
    const distanceX = Math.abs(playerX - this.x)
    const distanceY = Math.abs(playerY - this.y)

    if (distanceX <= this.detectRange && distanceY <= 100) {
      // 돌진 시작
      this._state = SnowLeopardState.CHARGING
      this.direction = playerX > this.x ? 1 : -1
      this.setFlipX(this.direction < 0)
    }
  }

  private updateCharging() {
    // 처음 감지된 방향으로만 계속 돌진 (방향 변경 없음)
    // 물리 바디가 sleep 상태에 들어가지 않도록 설정
    const body = this.body as MatterJS.BodyType
    if (body) {
      this.scene.matter.body.setVelocity(body, {
        x: this.moveSpeed * this.direction * 0.02,
        y: body.velocity.y // y 속도는 물리 엔진에 맡김
      })
    }

    // 발판에서 떨어졌는지 확인 (y 속도가 양수면 떨어지는 중)
    const velocity = this.body?.velocity as Phaser.Math.Vector2
    if (velocity && velocity.y > 2) {
      this._state = SnowLeopardState.FALLING
    }
  }

  private updateFalling() {
    // 떨어지는 중에도 같은 방향으로 이동 (방향 변경 없음)
    const body = this.body as MatterJS.BodyType
    if (body) {
      this.scene.matter.body.setVelocity(body, {
        x: this.moveSpeed * this.direction * 0.01,
        y: body.velocity.y // y 속도는 물리 엔진에 맡김
      })
    }
  }

  // 발판에 착지했을 때 호출 - 계속 추적 상태로 전환
  onLandedOnPlatform() {
    if (this._state === SnowLeopardState.FALLING) {
      this._state = SnowLeopardState.CHARGING
    }
  }

  // 맵 바닥으로 추락했을 때 호출
  onFellOffMap() {
    this._state = SnowLeopardState.DEAD
    this.setVisible(false)
    this.setActive(false)
    // 물리 바디 비활성화
    const body = this.body as MatterJS.BodyType
    if (body) {
      this.scene.matter.world.remove(body)
    }
  }

  // 설표 리스폰 (플레이어가 설표 위치보다 아래로 떨어졌을 때)
  respawn() {
    this._state = SnowLeopardState.IDLE
    this.direction = 0
    this.isOnSpawnPlatform = true
    this.setVisible(true)
    this.setActive(true)

    // 물리 바디 재생성 (world에서 제거되었으므로 새로 만들어야 함)
    this.setBody({
      type: 'rectangle',
      width: 28,
      height: 28,
    })
    this.setFriction(GAME_CONSTANTS.PLAYER_FRICTION)
    this.setBounce(GAME_CONSTANTS.PLAYER_BOUNCE)
    this.setFixedRotation()
    this.setFrictionAir(0.01)
    this.setCollisionCategory(COLLISION_CATEGORIES.LEOPARD)
    this.setCollidesWith(COLLISION_MASKS.LEOPARD)

    const newBody = this.body as MatterJS.BodyType
    if (newBody) {
      newBody.label = 'leopard'
    }

    // 위치와 속도 설정 (바디 생성 후에 해야 함)
    this.setPosition(this.spawnX, this.spawnY)
    this.setVelocity(0, 0)
  }

  // Getter 메서드들
  getState(): SnowLeopardState {
    return this._state
  }

  getSpawnY(): number {
    return this.spawnY
  }

  getSpawnPlatformIndex(): number {
    return this.spawnPlatformIndex
  }

  isAlive(): boolean {
    return this._state !== SnowLeopardState.DEAD
  }

  isDead(): boolean {
    return this._state === SnowLeopardState.DEAD
  }

  // 스폰 발판 위에 있는지 확인
  isStillOnSpawnPlatform(): boolean {
    return this.isOnSpawnPlatform
  }

  // 스폰 발판 상태 설정
  setOnSpawnPlatform(value: boolean) {
    this.isOnSpawnPlatform = value
  }

  // 화면 비율 업데이트 (리사이즈 시)
  setScreenScaleX(scaleX: number) {
    this.screenScaleX = scaleX
    this.moveSpeed = this.baseSpeed * this.screenScaleX
  }

  // 스폰 위치 X 업데이트 (리사이즈 시)
  setSpawnX(x: number) {
    this.spawnX = x
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene)
  }
}
