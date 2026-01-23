```markdown
# 고트 백 홈 (Goat Back Home) - PRD

## 📋 프로젝트 개요

### 게임 컨셉
점프킹 스타일의 2D 플랫포머 게임. 플레이어는 산양이 되어 험난한 산을 오르며, 떨어지면 처음부터 다시 시작해야 하는 고난이도 게임.

### 타겟 유저
- 고난이도 게임을 즐기는 캐주얼 게이머
- 점프킹, Getting Over It 등을 플레이한 유저
- 도전과 반복 플레이를 즐기는 유저

### 핵심 가치
- 간단한 조작, 어려운 난이도
- 실수의 대가가 큰 긴장감
- 클리어 성취감
- 경쟁적 랭킹 시스템

---

## 🎮 게임 기능 명세

### 1. 게임 플레이

#### 1.1 조작 시스템
**입력 방식:**
- 좌우 방향키: 점프 방향 선택
- 스페이스바 또는 마우스 클릭: 점프 파워 차징
  - 누르는 시간에 비례하여 점프 파워 증가 (0~100%)
  - 최대 차징: 2초
  - 파워 게이지 UI로 시각화
**모바일 터치 컨트롤:**
- 화면 하단에 **반투명 UI** 표시
- 좌측: **[◀] [▶]** 방향 버튼
- 우측: **[JUMP]** 점프 버튼 (길게 누르면 차징)
- 버튼 크기: 최소 48x48px (터치 편의성)
- 투명도: 50% (게임 화면 방해 최소화)

**점프 메커니즘:**
```typescript
// 의사 코드
let jumpPower = 0
const MAX_POWER = 100
const CHARGE_RATE = 50 // per second

onKeyDown('space') {
  // 파워 증가 시작
  chargingInterval = setInterval(() => {
    jumpPower = Math.min(jumpPower + CHARGE_RATE * deltaTime, MAX_POWER)
  }, 16)
}

onKeyUp('space') {
  // 점프 실행
  const direction = getDirectionFromArrowKeys() // -1 (left), 0 (up), 1 (right)
  player.velocity.x = direction * jumpPower * 0.3
  player.velocity.y = -jumpPower
  jumpPower = 0
  clearInterval(chargingInterval)
}
```

#### 1.2 물리 시스템
**Matter.js 설정 (초기값, 테스트 후 조정 필요):**
- 중력: { x: 0, y: 1 } *(프로토타입에서 튜닝)*
- 플레이어 마찰력: 0.005 (미끄러운 발) *(테스트 후 조정)*
- 플레이어 탄성: 0.2 (약간 튕김)
- 회전 고정: true (캐릭터가 회전하지 않음)
- **참고:** 점프 파워, 중력, 발판 간격의 밸런스는 프로토타입 단계에서 반복 테스트로 확정

**충돌 타입:**
1. **일반 발판**: 착지 가능, 마찰력 보통
2. **기울어진 발판**: 각도 15~45도, 자동으로 미끄러짐
3. **얼음 발판**: 마찰력 0.001, 매우 미끄러움

#### 1.3 장애물 시스템
**1. 날아다니는 새 (Flying Bird)**
- 특정 위치에서 수평 왕복 이동 (3초 주기)
- 충돌 시 플레이어를 **새의 이동 방향으로 강하게 튕겨냄** (추락 유발 수준)
- 속도: 100 px/s

**2. 양을 쫓는 표범 (Chasing Leopard)**
- 특정 구간의 발판 위에서 대기
- 플레이어 감지 범위: 300px
- 감지 시 플레이어를 향해 **돌진** (속도: 150 px/s)
- **물리 엔진 동일 적용**: 발판에 올라가지 못하면 추락
- 추락 또는 화면 밖으로 벗어나면 **제거**
- 플레이어가 해당 구간을 완전히 지나 위로 올라가면 **리스폰**
- 한 구간에 **1마리만** 존재
- **접촉 시 즉시 게임오버** (결과 화면으로 이동)

**3. 이동하는 발판 (Moving Platform)**
- 좌우 또는 상하 이동
- 이동 범위: 200px
- 주기: 4초

```typescript
// 장애물 타입 정의
interface Obstacle {
  type: 'bird' | 'leopard' | 'movingPlatform'
  position: { x: number, y: number }
  pattern: 'horizontal' | 'vertical' | 'chase'
  speed: number
  range?: number
}
```

#### 1.4 맵 구조
**총 높이:** 5000px (약 8-10화면 분량)

**구역 구성:**
```
높이 (px)  | 구역명      | 난이도 | 특징
-----------|------------|--------|------------------------
0-1000     | 초반부     | ⭐     | 넓은 발판, 장애물 없음
1000-2000  | 중반부     | ⭐⭐   | 좁은 발판, 새 등장
2000-3500  | 후반부     | ⭐⭐⭐ | 기울어진 발판, 표범 등장
3500-5000  | 최종 구간 | ⭐⭐⭐⭐ | 이동 발판, 복합 장애물
```

**발판 간격:**
- 초반부: 150-200px
- 중반부: 200-300px
- 후반부: 300-400px (최대 점프 범위)

#### 1.5 낙하 시스템
**착지 판정 (isGrounded):**
- 산양 캐릭터가 **발판과 맞닿아 있으면** `isGrounded = true`
- 그 외 모든 상황은 **공중 상태** (`isGrounded = false`)

**낙하 처리:**
1. 낙하 애니메이션 재생
2. 카메라는 플레이어를 따라 빠르게 하강 (1.5x 속도)
3. 바닥 또는 발판 충돌 시 정지
4. **바닥까지 추락해도 게임오버 아님** - 해당 위치에서 계속 플레이

**체크포인트:**
- 없음 (떨어져도 게임오버 없이 바닥부터 다시 올라가야 함)
- 이것이 핵심 난이도

**게임오버 조건:**
- **표범에게 접촉 시에만** 즉시 게임오버 (결과 화면으로 이동)

---

### 2. UI/UX

#### 2.1 메인 메뉴
```
┌─────────────────────────────┐
│      GOAT BACK HOME         │
│                             │
│   [닉네임 입력창]           │
│                             │
│      [PLAY GAME]            │
│      [LEADERBOARD]          │
│      [HOW TO PLAY]          │
│                             │
└─────────────────────────────┘
```

**닉네임 입력:**
- 최대 12자
- 영문, 한글, 숫자, 이모지 허용
- LocalStorage에 저장 (다음 방문 시 자동 입력)

#### 2.2 게임 화면 HUD
```
┌─────────────────────────────┐
│ TIME: 05:23  HEIGHT: 2340m │  ← 상단
│                             │
│                             │
│         [게임 화면]         │
│                             │
│                             │
│ [━━━━━━━━━━] 75%           │  ← 하단 (점프 파워 게이지)
└─────────────────────────────┘
```

**HUD 요소:**
- 경과 시간 (MM:SS)
- 현재 높이 (미터 단위)
- 점프 파워 게이지 (차징 중에만 표시)

#### 2.3 게임오버/클리어 화면
```
┌─────────────────────────────┐
│       GOAL REACHED!         │
│                             │
│    Clear Time: 12:34        │
│    Best Height: 5000m       │
│                             │
│       RANK #42              │
│                             │
│    [PLAY AGAIN]             │
│    [VIEW RANKING]           │
│    [MAIN MENU]              │
└─────────────────────────────┘
```

#### 2.4 랭킹 화면
```
┌─────────────────────────────┐
│        LEADERBOARD          │
│                             │
│  1. PlayerOne    05:23      │
│  2. GoatMaster   06:45      │
│  3. MountainKing 07:12      │
│  ...                        │
│  42. YOU         12:34      │  ← 하이라이트
│  ...                        │
│                             │
│  [CLOSE]                    │
└─────────────────────────────┘
```

**랭킹 표시:**
- 상위 100명
- 본인 순위는 항상 표시 (스크롤 자동 이동)
- 데이터: 순위, 닉네임, 클리어 타임

---

### 3. 아트 & 사운드

#### 3.1 도트 그래픽 스펙
**캐릭터 (산양):**
- 크기: 32x32px
- 스프라이트 시트:
  ```
  goat_idle.png     (1프레임)
  goat_jump.png     (2프레임, 8fps)
  goat_fall.png     (2프레임, 8fps)
  goat_land.png     (1프레임)
  ```

**배경:**
- 산 배경 (패럴랙스 스크롤)
- 레이어 3개: 원경 산맥, 중경 나무, 근경 바위

**타일셋:**
- 일반 발판: 64x16px
- 기울어진 발판: 64x16px (15°, 30°, 45° 각도별)
- 얼음 발판: 64x16px (파란색 톤)

**장애물:**
- 새: 24x24px (2프레임 날갯짓)
- 표범: 48x32px (2프레임 달리기)

#### 3.2 사운드 리스트
**효과음:**
```
sounds/
├── jump.mp3          (점프 시작)
├── land.mp3          (착지)
├── fall_whoosh.mp3   (낙하 중 바람 소리, 루프)
├── crash.mp3         (바닥 충돌)
├── bird_chirp.mp3    (새 등장)
├── leopard_roar.mp3  (표범 등장)
├── success.mp3       (클리어)
└── fail.mp3          (게임오버)
```

**BGM:**
```
music/
├── menu_bgm.mp3      (메인 메뉴, 차분한 어쿠스틱)
└── game_bgm.mp3      (게임 중, 긴장감 있는 루프)
```

**사운드 설정:**
- 효과음 볼륨: 70%
- BGM 볼륨: 40%
- 모든 사운드 페이드인/아웃 100ms

---

## 🛠 기술 스택

### 프론트엔드
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "gameEngine": "Phaser 3.70+",
  "physics": "Matter.js (Phaser 내장)",
  "styling": "Tailwind CSS",
  "stateManagement": "Zustand (게임 상태 관리)"
}
```

### 백엔드 & 데이터베이스
```json
{
  "database": "Supabase PostgreSQL",
  "hosting": "Vercel",
  "auth": "없음 (닉네임만 사용)",
  "realtime": "Supabase Realtime (선택적)"
}
```

### 개발 도구
```json
{
  "packageManager": "npm",
  "linter": "ESLint",
  "formatter": "Prettier",
  "versionControl": "Git"
}
```

---

## 📊 데이터베이스 스키마

### Supabase 테이블 설계

#### `scores` 테이블
```sql
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname VARCHAR(12) NOT NULL,
  clear_time INTEGER NOT NULL,  -- 초 단위 (예: 754 = 12분 34초)
  max_height INTEGER NOT NULL,  -- 픽셀 단위
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인덱스
  INDEX idx_clear_time (clear_time ASC),
  INDEX idx_created_at (created_at DESC)
);

-- Row Level Security (RLS) 설정
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- 모든 사람이 읽기 가능
CREATE POLICY "Anyone can view scores"
  ON scores FOR SELECT
  USING (true);

-- 모든 사람이 쓰기 가능 (닉네임만 사용)
CREATE POLICY "Anyone can insert scores"
  ON scores FOR INSERT
  WITH CHECK (true);
```

#### API 엔드포인트

**1. 점수 저장**
```typescript
// POST /api/scores
interface ScoreSubmitRequest {
  nickname: string
  clear_time: number  // 초 단위
  max_height: number  // 픽셀 단위
}

interface ScoreSubmitResponse {
  success: boolean
  rank?: number  // 전체 순위
  data?: Score
}
```

**2. 랭킹 조회**
```typescript
// GET /api/scores?limit=100
interface LeaderboardResponse {
  scores: Score[]
  total: number
  userRank?: {
    rank: number
    score: Score
  }
}

interface Score {
  id: string
  nickname: string
  clear_time: number
  max_height: number
  created_at: string
}
```

---

## 🏗 프로젝트 구조

```
goat-back-home/
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   │   ├── goat_idle.png
│   │   │   ├── goat_jump.png
│   │   │   ├── goat_fall.png
│   │   │   └── goat_land.png
│   │   ├── tiles/
│   │   │   ├── platform_normal.png
│   │   │   ├── platform_ice.png
│   │   │   └── platform_tilted.png
│   │   ├── obstacles/
│   │   │   ├── bird.png
│   │   │   └── leopard.png
│   │   ├── backgrounds/
│   │   │   ├── sky.png
│   │   │   ├── mountains.png
│   │   │   └── trees.png
│   │   └── sounds/
│   │       ├── jump.mp3
│   │       ├── land.mp3
│   │       └── ...
│   └── fonts/
│       └── pixel-font.ttf
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # 메인 메뉴
│   │   ├── game/
│   │   │   └── page.tsx          # 게임 화면 (Phaser 마운트)
│   │   ├── leaderboard/
│   │   │   └── page.tsx          # 랭킹 화면
│   │   └── api/
│   │       └── scores/
│   │           └── route.ts      # 점수 API
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── game/
│   │   │   ├── GameCanvas.tsx    # Phaser 래퍼
│   │   │   ├── HUD.tsx           # 게임 HUD
│   │   │   └── PowerGauge.tsx    # 점프 파워 게이지
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Supabase 클라이언트
│   │   └── phaser/
│   │       ├── config.ts         # Phaser 설정
│   │       ├── scenes/
│   │       │   ├── PreloadScene.ts   # 에셋 로딩
│   │       │   ├── MenuScene.ts      # 메뉴 (사용 안 함, Next.js에서 처리)
│   │       │   ├── GameScene.ts      # 메인 게임
│   │       │   └── GameOverScene.ts  # 게임오버/클리어
│   │       ├── entities/
│   │       │   ├── Player.ts         # 산양 캐릭터
│   │       │   ├── Platform.ts       # 발판
│   │       │   └── obstacles/
│   │       │       ├── Bird.ts
│   │       │       └── Leopard.ts
│   │       └── utils/
│   │           ├── mapGenerator.ts   # 맵 생성 로직
│   │           └── physics.ts        # 물리 헬퍼
│   │
│   ├── store/
│   │   └── gameStore.ts          # Zustand 상태 관리
│   │
│   ├── types/
│   │   ├── game.d.ts             # 게임 타입 정의
│   │   └── supabase.d.ts         # Supabase 타입
│   │
│   └── styles/
│       └── globals.css           # Tailwind + 전역 스타일
│
├── .env.local                    # 환경 변수
├── next.config.js
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🎯 구현 우선순위 & 마일스톤

### Week 1: 핵심 메커니즘 (MVP)

#### Day 1-2: 프로젝트 셋업 & 기본 점프 (4h)
- [ ] Next.js + TypeScript 프로젝트 생성
- [ ] Phaser 3 설치 및 기본 설정
- [ ] Matter.js 물리 엔진 활성화
- [ ] 플레이어 스프라이트 로드 (임시 사각형 가능)
- [ ] 기본 점프 구현 (스페이스바)
- [ ] 바닥 충돌 감지

**테스트:** 플레이어가 점프하고 착지할 수 있어야 함

#### Day 3-4: 점프 차징 & 방향 제어 (4h)
- [ ] 점프 파워 차징 시스템
- [ ] 좌우 방향키로 점프 방향 제어
- [ ] 파워 게이지 UI (간단한 바 형태)
- [ ] 물리 파라미터 튜닝 (중력, 마찰력)

**테스트:** 차징 시간에 따라 점프 거리가 달라져야 함

#### Day 5-7: 맵 & 카메라 (6h)
- [ ] 발판 5-10개 수동 배치
- [ ] 카메라 플레이어 따라가기 (Y축 중심)
- [ ] 낙하 시스템 (바닥으로 리스폰)
- [ ] 높이(HEIGHT) 계산 및 표시
- [ ] 타이머 구현

**테스트:** 발판을 오르며 카메라가 자연스럽게 따라가야 함

---

### Week 2: 게임 요소 추가

#### Day 8-10: 장애물 시스템 (8h)
- [ ] 새 장애물 구현
  - [ ] 왕복 이동 패턴
  - [ ] 충돌 시 넉백
- [ ] 표범 장애물 구현
  - [ ] 플레이어 감지 & 추격
  - [ ] 충돌 시 게임오버
- [ ] 장애물 배치 (맵 데이터)

**테스트:** 각 장애물이 의도한 대로 동작해야 함

#### Day 11-12: 특수 발판 (4h)
- [ ] 기울어진 발판 (미끄러짐)
- [ ] 얼음 발판 (낮은 마찰력)
- [ ] 이동하는 발판
- [ ] 발판 타입별 스프라이트

**테스트:** 각 발판에서 물리 반응이 달라야 함

#### Day 13-14: 맵 완성 & 밸런싱 (6h)
- [ ] 전체 맵 구성 (5000px 높이)
- [ ] 구역별 난이도 조절
- [ ] 발판 간격 최적화
- [ ] 클리어 가능 여부 테스트

**테스트:** 숙련된 플레이어가 10-15분 내 클리어 가능해야 함

---

### Week 3: UI/UX & 백엔드 연동

#### Day 15-16: UI 구현 (4h)
- [ ] 메인 메뉴 화면
  - [ ] 닉네임 입력
  - [ ] 플레이 버튼
  - [ ] 랭킹 버튼
- [ ] 게임 HUD
  - [ ] 타이머, 높이 표시
  - [ ] 파워 게이지 개선
- [ ] 게임오버/클리어 모달

**테스트:** 모든 화면 전환이 자연스러워야 함

#### Day 17-18: Supabase 연동 (3h)
- [ ] Supabase 프로젝트 생성
- [ ] `scores` 테이블 생성
- [ ] API Routes 구현
  - [ ] POST /api/scores
  - [ ] GET /api/scores
- [ ] 클리어 시 점수 저장
- [ ] 랭킹 화면 데이터 연동

**테스트:** 클리어 후 랭킹에 내 기록이 나타나야 함

#### Day 19-21: 폴리싱 & 배포 (5h)
- [ ] 도트 그래픽 적용 (또는 에셋 다운로드)
- [ ] 사운드 추가
- [ ] 로딩 화면
- [ ] 모바일 대응 (터치 컨트롤)
- [ ] Vercel 배포
- [ ] 버그 수정

**테스트:** 프로덕션 환경에서 정상 동작

---

## 🔧 핵심 코드 스니펫

### 1. Phaser 설정 (lib/phaser/config.ts)

```typescript
import Phaser from 'phaser'
import PreloadScene from './scenes/PreloadScene'
import GameScene from './scenes/GameScene'
import GameOverScene from './scenes/GameOverScene'

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#87CEEB', // 하늘색
  pixelArt: true, // 도트 그래픽 필수!
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 1 },
      debug: process.env.NODE_ENV === 'development',
    },
  },
  scene: [PreloadScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}
```

### 2. 플레이어 엔티티 (lib/phaser/entities/Player.ts)

```typescript
import Phaser from 'phaser'

export class Player extends Phaser.Physics.Matter.Sprite {
  private jumpPower: number = 0
  private isCharging: boolean = false
  private maxPower: number = 20
  private direction: number = 0 // -1: left, 0: up, 1: right
  public isGrounded: boolean = false // 발판과 맞닿아 있는지
  public isOnGoalPlatform: boolean = false // 골인 발판 위인지

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'goat', 'idle')
    
    scene.add.existing(this)
    
    // 물리 설정
    this.setFixedRotation()
    this.setFriction(0.005)
    this.setBounce(0.2)
    
    // 입력 설정
    this.setupInput()
  }

  private setupInput() {
    const cursors = this.scene.input.keyboard!.createCursorKeys()
    const spaceKey = this.scene.input.keyboard!.addKey('SPACE')

    // 방향키
    this.scene.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') this.direction = -1
      if (event.key === 'ArrowRight') this.direction = 1
    })

    this.scene.input.keyboard!.on('keyup', (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        this.direction = 0
      }
    })

    // 점프 차징
    spaceKey.on('down', () => {
      this.isCharging = true
      this.setTexture('goat', 'charge') // 차징 애니메이션
    })

    spaceKey.on('up', () => {
      if (this.isCharging) {
        this.jump()
        this.isCharging = false
        this.jumpPower = 0
      }
    })
  }

  update(delta: number) {
    // 차징 중 파워 증가
    if (this.isCharging) {
      this.jumpPower = Math.min(
        this.jumpPower + (50 * delta) / 1000,
        this.maxPower
      )
      
      // 파워 게이지 이벤트 발생
      this.scene.events.emit('powerChanged', this.jumpPower / this.maxPower)
    }
  }

  private jump() {
    const power = this.jumpPower
    const dirX = this.direction * 0.3 * power
    const dirY = -power

    this.setVelocity(dirX, dirY)
    this.setTexture('goat', 'jump')

    // 사운드
    this.scene.sound.play('jump')
    
    // 파워 게이지 숨김
    this.scene.events.emit('jumpExecuted')
  }

  getHeight(): number {
    // 시작 지점 대비 높이 (m 단위)
    const startY = 5000 // 맵 바닥 Y 좌표
    return Math.round((startY - this.y) / 10)
  }
}
```

### 3. 게임 씬 (lib/phaser/scenes/GameScene.ts)

```typescript
import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { mapData } from '../utils/mapGenerator'

export default class GameScene extends Phaser.Scene {
  private player!: Player
  private platforms!: Phaser.Physics.Matter.Image[]
  private startTime!: number
  private timerText!: Phaser.GameObjects.Text
  private heightText!: Phaser.GameObjects.Text

  constructor() {
    super('GameScene')
  }

  create(data: { nickname: string }) {
    this.startTime = Date.now()

    // 배경 (패럴랙스)
    const bg1 = this.add.tileSprite(400, 300, 800, 600, 'mountains')
    const bg2 = this.add.tileSprite(400, 300, 800, 600, 'trees')

    // 플레이어 생성
    this.player = new Player(this, 400, 5000)

    // 맵 생성
    this.createMap()

    // 카메라
    this.cameras.main.startFollow(this.player, false, 0, 0.1)
    this.cameras.main.setBounds(0, 0, 800, 5000)

    // HUD
    this.createHUD()

    // 충돌 감지
    this.matter.world.on('collisionstart', this.handleCollision, this)

    // 낙하 체크
    this.time.addEvent({
      delay: 100,
      callback: this.checkFalling,
      callbackScope: this,
      loop: true,
    })

    // 배경 패럴랙스 업데이트
    this.events.on('update', () => {
      bg1.tilePositionY = this.cameras.main.scrollY * 0.3
      bg2.tilePositionY = this.cameras.main.scrollY * 0.6
    })
  }

  update(time: number, delta: number) {
    this.player.update(delta)

    // HUD 업데이트
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    this.timerText.setText(
      `TIME: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    )
    this.heightText.setText(`HEIGHT: ${this.player.getHeight()}m`)

    // 클리어 체크 (골인 발판 착지)
    if (this.player.isOnGoalPlatform) {
      this.handleClear(elapsed)
    }
  }

  private createMap() {
    // mapData는 별도 파일에서 정의된 발판 정보 배열
    mapData.forEach((platform) => {
      const p = this.matter.add.image(
        platform.x,
        platform.y,
        platform.texture
      )
      p.setStatic(true)
      p.setFriction(platform.friction || 0.1)
      if (platform.angle) p.setAngle(platform.angle)
    })
  }

  private createHUD() {
    this.timerText = this.add
      .text(16, 16, 'TIME: 00:00', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(100)

    this.heightText = this.add
      .text(16, 46, 'HEIGHT: 0m', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setScrollFactor(0)
      .setDepth(100)
  }

  private handleCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
    // 장애물 충돌 처리
    // TODO: 새, 표범 충돌 감지
  }

  private checkFalling() {
    // 플레이어가 계속 떨어지고 있는지 확인
    if (this.player.y > 4900 && this.player.body.velocity.y > 5) {
      // 바닥 근처로 추락 중
      this.handleGameOver()
    }
  }

  private handleClear(clearTime: number) {
    this.scene.pause()
    this.scene.launch('GameOverScene', {
      success: true,
      clearTime,
      height: this.player.getHeight(),
    })
  }

  private handleGameOver() {
    this.scene.pause()
    this.scene.launch('GameOverScene', {
      success: false,
      clearTime: 0,
      height: this.player.getHeight(),
    })
  }
}
```

### 4. API Route (app/api/scores/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 점수 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nickname, clear_time, max_height } = body

    // 유효성 검사
    if (!nickname || !clear_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 저장
    const { data, error } = await supabase
      .from('scores')
      .insert({
        nickname: nickname.slice(0, 12), // 12자 제한
        clear_time,
        max_height,
      })
      .select()
      .single()

    if (error) throw error

    // 순위 계산
    const { count } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .lt('clear_time', clear_time)

    return NextResponse.json({
      success: true,
      rank: (count || 0) + 1,
      data,
    })
  } catch (error) {
    console.error('Score save error:', error)
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    )
  }
}

// 랭킹 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '100')
  const nickname = searchParams.get('nickname')

  try {
    // 상위 N명 조회
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .order('clear_time', { ascending: true })
      .limit(limit)

    if (error) throw error

    // 특정 닉네임 순위 조회
    let userRank = null
    if (nickname) {
      const { data: userScore } = await supabase
        .from('scores')
        .select('*')
        .eq('nickname', nickname)
        .order('clear_time', { ascending: true })
        .limit(1)
        .single()

      if (userScore) {
        const { count } = await supabase
          .from('scores')
          .select('*', { count: 'exact', head: true })
          .lt('clear_time', userScore.clear_time)

        userRank = {
          rank: (count || 0) + 1,
          score: userScore,
        }
      }
    }

    return NextResponse.json({
      scores,
      total: scores?.length || 0,
      userRank,
    })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
```

### 5. 맵 데이터 (lib/phaser/utils/mapGenerator.ts)

```typescript
export interface PlatformData {
  x: number
  y: number
  texture: 'platform' | 'platform_ice' | 'platform_tilted'
  width?: number
  friction?: number
  angle?: number
  isGoal?: boolean  // 골인 발판 여부
}

export const mapData: PlatformData[] = [
  // 시작 지점
  { x: 400, y: 5000, texture: 'platform', width: 200 },
  
  // 초반부 (높이 4000-5000)
  { x: 300, y: 4800, texture: 'platform' },
  { x: 500, y: 4600, texture: 'platform' },
  { x: 250, y: 4400, texture: 'platform' },
  { x: 550, y: 4200, texture: 'platform' },
  { x: 350, y: 4000, texture: 'platform' },

  // 중반부 (높이 2000-4000) - 좁은 발판
  { x: 200, y: 3800, texture: 'platform', width: 128 },
  { x: 600, y: 3600, texture: 'platform', width: 128 },
  { x: 300, y: 3400, texture: 'platform_ice', friction: 0.001 },
  { x: 500, y: 3200, texture: 'platform', width: 128 },
  
  // 중반부 - 기울어진 발판 등장
  { x: 400, y: 3000, texture: 'platform_tilted', angle: 15 },
  { x: 250, y: 2800, texture: 'platform', width: 128 },
  { x: 550, y: 2600, texture: 'platform_tilted', angle: -20 },

  // 후반부 (높이 1000-2000) - 어려움
  { x: 350, y: 2400, texture: 'platform', width: 96 },
  { x: 450, y: 2200, texture: 'platform_ice', width: 96, friction: 0.001 },
  { x: 200, y: 2000, texture: 'platform_tilted', angle: 30, width: 128 },

  // 최종 구간 (높이 0-1000) - 극악
  { x: 600, y: 1800, texture: 'platform', width: 64 },
  { x: 200, y: 1600, texture: 'platform', width: 64 },
  { x: 500, y: 1400, texture: 'platform_ice', width: 96 },
  { x: 300, y: 1200, texture: 'platform_tilted', angle: 45 },
  { x: 450, y: 1000, texture: 'platform', width: 64 },
  { x: 250, y: 800, texture: 'platform', width: 64 },
  { x: 550, y: 600, texture: 'platform', width: 96 },
  { x: 350, y: 400, texture: 'platform', width: 96 },
  { x: 450, y: 200, texture: 'platform', width: 128 },
  
  // 골인 지점 (착지 시 클리어)
  { x: 400, y: 50, texture: 'platform', width: 300, isGoal: true },
]

// 장애물 데이터 (나중에 추가)
export const obstacleData = [
  // { type: 'bird', x: 400, y: 3500, pattern: 'horizontal', range: 200 },
  // { type: 'leopard', x: 300, y: 2500, pattern: 'chase' },
]
```

---

## 📝 환경 변수 (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
NEXT_PUBLIC_GAME_VERSION=1.0.0
```

---

## 🧪 테스트 체크리스트

### 기능 테스트
- [ ] 점프 차징이 0-100% 범위에서 작동
- [ ] 방향키로 점프 방향 제어 가능
- [ ] 발판 충돌 감지 정확
- [ ] 낙하 시 바닥으로 리스폰
- [ ] 타이머가 정확하게 작동
- [ ] 높이 계산이 정확
- [ ] 클리어 시 점수 저장
- [ ] 랭킹 조회 정상 작동

### 물리 테스트
- [ ] 중력이 자연스러움
- [ ] 미끄러운 발판에서 실제로 미끄러짐
- [ ] 기울어진 발판에서 자동으로 미끄러짐
- [ ] 점프 파워에 비례하여 높이/거리 증가
- [ ] 캐릭터가 회전하지 않음

### 난이도 테스트
- [ ] 초반부는 쉽게 클리어 가능
- [ ] 중반부부터 도전적
- [ ] 후반부는 여러 번 시도 필요
- [ ] 전체 클리어 시간 10-15분 (숙련자 기준)

### UI/UX 테스트
- [ ] 닉네임 입력 후 저장됨
- [ ] 파워 게이지가 명확하게 보임
- [ ] HUD가 게임플레이를 방해하지 않음
- [ ] 게임오버/클리어 모달이 명확
- [ ] 랭킹 화면에서 본인 위치 강조

### 모바일 테스트
- [ ] 터치 조작이 반응함
- [ ] 화면 크기에 맞게 스케일링
- [ ] 세로/가로 모드 모두 지원
- [ ] 프레임 드랍 없음 (최소 30fps)

### 성능 테스트
- [ ] 60fps 유지 (데스크톱)
- [ ] 메모리 누수 없음 (10분 플레이 후 확인)
- [ ] 초기 로딩 3초 이하

---

## 🚀 배포 가이드

### Vercel 배포

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 연결
vercel link

# 4. 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 5. 배포
vercel --prod
```

### 배포 전 체크리스트
- [ ] `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- [ ] Vercel 환경 변수 설정 완료
- [ ] Supabase RLS 정책 활성화
- [ ] 프로덕션 빌드 테스트 (`npm run build`)
- [ ] 도메인 연결 (선택)

---

## 🎨 에셋 리소스 추천

### 도트 그래픽
1. **Kenney.nl** - https://kenney.nl/assets
   - Platformer Pack 추천
   - 완전 무료 (CC0)

2. **itch.io** - https://itch.io/game-assets/free/tag-pixel-art
   - "Sunny Land" 팩 추천
   - 산 배경 포함

3. **직접 제작** - https://www.piskelapp.com
   - 32x32 산양 스프라이트

### 사운드
1. **Pixabay** - https://pixabay.com/sound-effects/
   - jump, land, wind 검색

2. **Freesound.org** - https://freesound.org
   - 고품질 효과음

3. **Incompetech** - https://incompetech.com
   - BGM (Kevin MacLeod)

---

## ❓ FAQ & 트러블슈팅

### Q: Phaser가 Next.js에서 SSR 에러 발생
```typescript
// 해결: dynamic import 사용
// components/game/GameCanvas.tsx
'use client'
import dynamic from 'next/dynamic'

const PhaserGame = dynamic(() => import('./PhaserGame'), {
  ssr: false,
  loading: () => <div>Loading game...</div>,
})
```

### Q: Matter.js 충돌 감지가 부정확
```typescript
// 해결: 플레이어 바디 크기 조정
this.setBody({
  type: 'rectangle',
  width: 28, // 스프라이트보다 약간 작게
  height: 28,
})
```

### Q: 모바일에서 터치 감도 문제
```typescript
// 해결: 터치 영역 확대
this.input.addPointer(3) // 멀티터치 지원
this.input.on('pointerdown', (pointer) => {
  // 터치 처리
})
```

### Q: 랭킹 중복 닉네임 처리
```typescript
// 해결: 닉네임 + 타임스탬프 조합
const uniqueId = `${nickname}_${Date.now()}`
// 또는 Supabase UUID 사용 (기본값)
```

---

## 📚 참고 자료

### Phaser 3 공식 문서
- https://photonstorm.github.io/phaser3-docs/
- Matter.js 예제: https://phaser.io/examples/v3/category/physics/matterjs

### Supabase 문서
- https://supabase.com/docs
- JavaScript 클라이언트: https://supabase.com/docs/reference/javascript

### 유사 게임 레퍼런스
- Jump King: https://store.steampowered.com/app/1061090/Jump_King/
- Getting Over It: https://store.steampowered.com/app/240720/Getting_Over_It_with_Bennett_Foddy/

---

## 🎯 성공 지표 (출시 후)

### 주요 메트릭
- DAU (Daily Active Users): 목표 100명 (첫 주)
- 평균 플레이 시간: 10분+
- 클리어율: 5-10% (극난이도 게임 기준)
- 재방문율: 30%+

### 개선 로드맵 (v2.0)
- [ ] 체크포인트 아이템 (유료 또는 광고 시청)
- [ ] 일일 챌린지 모드
- [ ] 리플레이 저장 & 공유
- [ ] 스킨 커스터마이징
- [ ] 모바일 앱 (React Native 또는 Capacitor)

---

## 📞 개발 지원

**질문이나 이슈 발생 시:**
- GitHub Issues 활용
- Phaser Discord: https://discord.gg/phaser
- Supabase Discord: https://discord.supabase.com

**이 PRD 문서 버전:** 1.1
**최종 업데이트:** 2025-01-23
**작성자:** Claude (Anthropic)

### 변경 이력
| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-01-23 | 초안 작성 |
| 1.1 | 2025-01-23 | 표범 AI 로직 상세화, 새 넉백 강도 명시, 착지 판정 명확화, 클리어 조건 변경(골인 발판 착지), 게임오버 조건 명확화, 모바일 터치 UI 상세화 |

---

```