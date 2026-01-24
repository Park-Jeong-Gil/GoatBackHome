import Phaser from 'phaser'
import { PlatformData, PlatformShape } from '@/types/game.d'
import { GAME_CONSTANTS, COLLISION_CATEGORIES, COLLISION_MASKS } from '../config'

const PLATFORM_THICKNESS = 16  // 발판 두께
const LIP_HEIGHT = 20          // 턱 높이 (낮게)
const LIP_WIDTH = 16           // 턱 너비
const SLOPE_FLAT_LENGTH = 25   // 경사 양 끝 평지 길이

/**
 * 발판에 충돌 카테고리 설정 (플레이어와만 충돌, 새는 통과)
 */
function applyPlatformCollision(platform: Phaser.Physics.Matter.Image) {
  platform.setCollisionCategory(COLLISION_CATEGORIES.PLATFORM)
  platform.setCollidesWith(COLLISION_MASKS.PLATFORM)
}

/**
 * 발판 모양에 따른 Compound Body 생성
 * @param index 발판 순서 번호 (개발 모드에서 표시용)
 */
export function createPlatformBody(
  scene: Phaser.Scene,
  platform: PlatformData,
  index?: number
): Phaser.GameObjects.GameObject {
  const shape = platform.shape || 'flat'
  const width = platform.width || 64
  // 얼음 발판은 자동으로 낮은 마찰력 적용
  const isIce = platform.texture === 'platform_ice'
  const defaultFriction = isIce
    ? GAME_CONSTANTS.PLATFORM_FRICTION.ICE
    : GAME_CONSTANTS.PLATFORM_FRICTION.NORMAL
  const friction = platform.friction ?? defaultFriction

  let result: Phaser.GameObjects.GameObject

  switch (shape) {
    case 'L':
      result = createLShape(scene, platform, width, friction, false)
      break
    case 'L_reverse':
      result = createLShape(scene, platform, width, friction, true)
      break
    case 'T':
      result = createTShape(scene, platform, width, friction)
      break
    case 'slope_up':
      result = createSlopeShape(scene, platform, width, friction, true)
      break
    case 'slope_down':
      result = createSlopeShape(scene, platform, width, friction, false)
      break
    case 'flat':
    default:
      result = createFlatShape(scene, platform, width, friction)
  }

  // 개발 편의를 위한 순서 번호 표시
  if (index !== undefined) {
    createPlatformLabel(scene, platform.x, platform.y, index)
  }

  return result
}

/**
 * 발판 위에 순서 번호 라벨 생성 (개발용)
 */
function createPlatformLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  index: number
): Phaser.GameObjects.Text {
  const label = scene.add.text(x, y - 25, `${index}`, {
    fontSize: '14px',
    color: '#ffffff',
    fontFamily: 'monospace',
    stroke: '#000000',
    strokeThickness: 3,
    backgroundColor: '#333333aa',
    padding: { x: 4, y: 2 },
  })
  label.setOrigin(0.5, 0.5)
  label.setDepth(50)
  return label
}

/**
 * 기본 평평한 발판
 */
function createFlatShape(
  scene: Phaser.Scene,
  platform: PlatformData,
  width: number,
  friction: number
): Phaser.Physics.Matter.Image {
  const texture = platform.isGoal ? 'platform_goal' : platform.texture
  const p = scene.matter.add.image(platform.x, platform.y, texture)
  p.setStatic(true)
  p.setFriction(friction)
  p.setDisplaySize(width, PLATFORM_THICKNESS)
  p.setBody({
    type: 'rectangle',
    width: width,
    height: PLATFORM_THICKNESS,
  })
  p.setStatic(true)

  if (platform.angle) {
    p.setAngle(platform.angle)
  }

  applyPlatformCollision(p)
  return p
}

/**
 * ㄴ 또는 ㄱ 모양 발판 - 한쪽에 작은 턱이 있는 형태
 */
function createLShape(
  scene: Phaser.Scene,
  platform: PlatformData,
  width: number,
  friction: number,
  reversed: boolean
): Phaser.GameObjects.Container {
  const container = scene.add.container(platform.x, platform.y)

  // 바닥 부분 (위치 버그 수정)
  const floor = scene.matter.add.image(platform.x, platform.y, platform.texture)
  floor.setStatic(true)
  floor.setFriction(friction)
  floor.setDisplaySize(width, PLATFORM_THICKNESS)
  floor.setBody({
    type: 'rectangle',
    width: width,
    height: PLATFORM_THICKNESS,
  })
  floor.setStatic(true)

  // 턱 부분 (낮은 높이)
  const lipX = reversed
    ? (width / 2 - LIP_WIDTH / 2)
    : -(width / 2 - LIP_WIDTH / 2)
  const lipY = -(LIP_HEIGHT / 2 + PLATFORM_THICKNESS / 2)

  const lip = scene.matter.add.image(
    platform.x + lipX,
    platform.y + lipY,
    platform.texture
  )
  lip.setStatic(true)
  lip.setFriction(friction)
  lip.setDisplaySize(LIP_WIDTH, LIP_HEIGHT)
  lip.setBody({
    type: 'rectangle',
    width: LIP_WIDTH,
    height: LIP_HEIGHT,
  })
  lip.setStatic(true)

  applyPlatformCollision(floor)
  applyPlatformCollision(lip)

  container.setData('floor', floor)
  container.setData('lip', lip)
  container.setData('bodies', [floor, lip])

  return container
}

/**
 * ㅜ 모양 발판 - 양쪽에 작은 턱이 있는 형태 (안전 지대)
 */
function createTShape(
  scene: Phaser.Scene,
  platform: PlatformData,
  width: number,
  friction: number
): Phaser.GameObjects.Container {
  const container = scene.add.container(platform.x, platform.y)

  // 바닥 부분
  const floor = scene.matter.add.image(platform.x, platform.y, platform.texture)
  floor.setStatic(true)
  floor.setFriction(friction)
  floor.setDisplaySize(width, PLATFORM_THICKNESS)
  floor.setBody({
    type: 'rectangle',
    width: width,
    height: PLATFORM_THICKNESS,
  })
  floor.setStatic(true)

  // 왼쪽 턱
  const leftLipX = -(width / 2 - LIP_WIDTH / 2)
  const lipY = -(LIP_HEIGHT / 2 + PLATFORM_THICKNESS / 2)

  const leftLip = scene.matter.add.image(
    platform.x + leftLipX,
    platform.y + lipY,
    platform.texture
  )
  leftLip.setStatic(true)
  leftLip.setFriction(friction)
  leftLip.setDisplaySize(LIP_WIDTH, LIP_HEIGHT)
  leftLip.setBody({
    type: 'rectangle',
    width: LIP_WIDTH,
    height: LIP_HEIGHT,
  })
  leftLip.setStatic(true)

  // 오른쪽 턱
  const rightLipX = width / 2 - LIP_WIDTH / 2

  const rightLip = scene.matter.add.image(
    platform.x + rightLipX,
    platform.y + lipY,
    platform.texture
  )
  rightLip.setStatic(true)
  rightLip.setFriction(friction)
  rightLip.setDisplaySize(LIP_WIDTH, LIP_HEIGHT)
  rightLip.setBody({
    type: 'rectangle',
    width: LIP_WIDTH,
    height: LIP_HEIGHT,
  })
  rightLip.setStatic(true)

  applyPlatformCollision(floor)
  applyPlatformCollision(leftLip)
  applyPlatformCollision(rightLip)

  container.setData('floor', floor)
  container.setData('leftLip', leftLip)
  container.setData('rightLip', rightLip)
  container.setData('bodies', [floor, leftLip, rightLip])

  return container
}

/**
 * 경사 발판 (양 끝 평지 포함)
 * slope_up: 왼쪽 낮음 → 오른쪽 높음
 * slope_down: 왼쪽 높음 → 오른쪽 낮음
 */
function createSlopeShape(
  scene: Phaser.Scene,
  platform: PlatformData,
  width: number,
  friction: number,
  goingUp: boolean
): Phaser.GameObjects.Container {
  const container = scene.add.container(platform.x, platform.y)

  const slopeWidth = width - SLOPE_FLAT_LENGTH * 2
  const slopeAngle = goingUp ? -12 : 12  // 완만한 경사

  // 경사면 끝점의 높이 차이 계산 (삼각함수 사용)
  const angleRad = Math.abs(slopeAngle) * Math.PI / 180
  const halfSlopeHeight = (slopeWidth / 2) * Math.sin(angleRad)

  // 왼쪽 평지 - 경사면의 왼쪽 끝과 연결
  const leftFlatX = -(width / 2) + SLOPE_FLAT_LENGTH / 2
  const leftFlatY = goingUp ? halfSlopeHeight : -halfSlopeHeight

  const leftFlat = scene.matter.add.image(
    platform.x + leftFlatX,
    platform.y + leftFlatY,
    platform.texture
  )
  leftFlat.setStatic(true)
  leftFlat.setFriction(friction)
  leftFlat.setDisplaySize(SLOPE_FLAT_LENGTH, PLATFORM_THICKNESS)
  leftFlat.setBody({
    type: 'rectangle',
    width: SLOPE_FLAT_LENGTH,
    height: PLATFORM_THICKNESS,
  })
  leftFlat.setStatic(true)

  // 중앙 경사 (중심은 platform.y에 위치)
  const slope = scene.matter.add.image(
    platform.x,
    platform.y,
    platform.texture
  )
  slope.setStatic(true)
  slope.setFriction(friction * 0.5)  // 경사는 미끄러움
  slope.setDisplaySize(slopeWidth, PLATFORM_THICKNESS)
  slope.setBody({
    type: 'rectangle',
    width: slopeWidth,
    height: PLATFORM_THICKNESS,
  })
  slope.setStatic(true)
  slope.setAngle(slopeAngle)

  // 오른쪽 평지 - 경사면의 오른쪽 끝과 연결
  const rightFlatX = width / 2 - SLOPE_FLAT_LENGTH / 2
  const rightFlatY = goingUp ? -halfSlopeHeight : halfSlopeHeight

  const rightFlat = scene.matter.add.image(
    platform.x + rightFlatX,
    platform.y + rightFlatY,
    platform.texture
  )
  rightFlat.setStatic(true)
  rightFlat.setFriction(friction)
  rightFlat.setDisplaySize(SLOPE_FLAT_LENGTH, PLATFORM_THICKNESS)
  rightFlat.setBody({
    type: 'rectangle',
    width: SLOPE_FLAT_LENGTH,
    height: PLATFORM_THICKNESS,
  })
  rightFlat.setStatic(true)

  applyPlatformCollision(leftFlat)
  applyPlatformCollision(slope)
  applyPlatformCollision(rightFlat)

  container.setData('leftFlat', leftFlat)
  container.setData('slope', slope)
  container.setData('rightFlat', rightFlat)
  container.setData('bodies', [leftFlat, slope, rightFlat])

  return container
}

/**
 * Container에서 모든 물리 바디 추출
 */
export function extractBodiesFromPlatform(
  obj: Phaser.GameObjects.GameObject
): Phaser.Physics.Matter.Image[] {
  if (obj instanceof Phaser.Physics.Matter.Image) {
    return [obj]
  }

  if (obj instanceof Phaser.GameObjects.Container) {
    const bodies = obj.getData('bodies')
    if (Array.isArray(bodies)) {
      return bodies
    }
  }

  return []
}
