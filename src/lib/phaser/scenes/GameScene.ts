import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Bird } from "../entities/Bird";
import { SnowLeopard, SnowLeopardState } from "../entities/SnowLeopard";
import { VirtualController } from "../ui/VirtualController";
import {
  getMapDataForScreen,
  getObstacleDataForScreen,
  getSnowLeopardDataForScreen,
} from "../utils/mapGenerator";
import {
  createPlatformBody,
  extractBodiesFromPlatform,
} from "../utils/platformFactory";
import {
  GAME_WIDTH,
  MAP_HEIGHT,
  GAME_CONSTANTS,
  DEBUG_CONFIG,
  COLLISION_CATEGORIES,
  COLLISION_MASKS,
  MOBILE_BREAKPOINT,
} from "../config";
import { PlatformData } from "@/types/game.d";

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms: Phaser.Physics.Matter.Image[] = [];
  private birds: Bird[] = [];
  private snowLeopards: SnowLeopard[] = [];
  private goalPlatform: Phaser.Physics.Matter.Image | null = null;
  private startTime!: number;
  private timerText!: Phaser.GameObjects.Text;
  private heightText!: Phaser.GameObjects.Text;
  private powerGauge!: Phaser.GameObjects.Graphics;
  private powerGaugeBackground!: Phaser.GameObjects.Graphics;

  // 화면 크기 기반 스케일 팩터
  private scaleX: number = 1;
  // 발판 원본 데이터 저장 (리사이즈 시 재계산용)
  private platformBodies: {
    body: Phaser.Physics.Matter.Image;
    originalX: number;
    originalWidth: number;
  }[] = [];
  // 씬 초기화 완료 플래그
  private isInitialized: boolean = false;
  // 현재 플레이어가 밟고 있는 얼음 발판
  private currentIcePlatform: Phaser.Physics.Matter.Image | null = null;
  // 도착 문 센서
  private goalDoorSensor: MatterJS.BodyType | null = null;
  // 도착 문 시각적 표시 (goal.png 이미지)
  private goalImage: Phaser.GameObjects.Image | null = null;
  // 가상 컨트롤러 (모바일용)
  private virtualController: VirtualController | null = null;
  // 모바일 모드 여부 (960px 이하)
  private isMobile: boolean = false;
  // 배경 타일 스프라이트
  private backgroundTile: Phaser.GameObjects.TileSprite | null = null;

  constructor() {
    super("GameScene");
  }

  create() {
    this.startTime = Date.now();

    // 스케일 팩터 계산 (기준 너비 960 대비)
    this.scaleX = this.scale.width / GAME_WIDTH;

    // 모바일 모드 감지 (960px 이하)
    this.isMobile = this.scale.width <= MOBILE_BREAKPOINT;

    // 타일 스프라이트 배경 생성 (전체 맵 높이만큼)
    this.backgroundTile = this.add.tileSprite(
      0,
      0,
      this.scale.width,
      MAP_HEIGHT,
      "mountains",
    );
    this.backgroundTile.setOrigin(0, 0);
    this.backgroundTile.setDepth(-10); // 가장 뒤에 배치

    // 좌우 벽 생성 (플레이어만 충돌, 새는 통과)
    this.createWalls();

    // 맵 생성
    this.createMap();

    // 새 장애물 생성
    this.createBirds();

    // 설표 장애물 생성
    this.createSnowLeopards();

    // 플레이어 시작 위치 결정
    const startPos = this.getPlayerStartPosition();
    this.player = new Player(this, startPos.x, startPos.y, this.scaleX);

    // 설표에 플레이어 참조 설정
    this.snowLeopards.forEach((leopard) => {
      leopard.setPlayerRef(this.player);
    });

    // 카메라 설정
    this.cameras.main.startFollow(
      this.player,
      false,
      0,
      GAME_CONSTANTS.CAMERA_LERP_Y,
    );
    this.cameras.main.setBounds(0, 0, this.scale.width, MAP_HEIGHT);

    // HUD 생성
    this.createHUD();

    // 가상 컨트롤러 생성 (터치 디바이스에서만)
    if (VirtualController.isTouchDevice()) {
      this.virtualController = new VirtualController(this, this.player);
    }

    // 충돌 감지 설정
    this.setupCollisions();

    // 이벤트 리스너
    this.events.on("powerChanged", this.updatePowerGauge, this);
    this.events.on("jumpExecuted", this.hidePowerGauge, this);

    // 리사이즈 이벤트 핸들러
    this.scale.on("resize", this.handleResize, this);

    // 씬 종료 시 정리
    this.events.on("shutdown", this.cleanup, this);

    // 초기화 완료
    this.isInitialized = true;

    // React에 게임 준비 완료 알림
    window.dispatchEvent(new CustomEvent("gameReady"));
  }

  private cleanup() {
    this.isInitialized = false;
    this.platformBodies = [];
    this.currentIcePlatform = null;
    this.goalDoorSensor = null;
    // 새 정리
    this.birds.forEach((bird) => bird.destroy());
    this.birds = [];
    // 설표 정리
    this.snowLeopards.forEach((leopard) => leopard.destroy());
    this.snowLeopards = [];
    if (this.goalImage) {
      this.goalImage.destroy();
      this.goalImage = null;
    }
    // 가상 컨트롤러 정리
    if (this.virtualController) {
      this.virtualController.destroy();
      this.virtualController = null;
    }
    // 배경 타일 스프라이트 정리
    if (this.backgroundTile) {
      this.backgroundTile.destroy();
      this.backgroundTile = null;
    }
    this.scale.off("resize", this.handleResize, this);
    this.events.off("powerChanged", this.updatePowerGauge, this);
    this.events.off("jumpExecuted", this.hidePowerGauge, this);
  }

  update(time: number, delta: number) {
    this.player.update(delta);

    // 새 장애물 업데이트
    this.birds.forEach((bird) => bird.update(delta));

    // 설표 장애물 업데이트
    this.snowLeopards.forEach((leopard) => leopard.update());

    // 설표 바닥 추락 체크 및 리스폰 체크
    this.checkSnowLeopardFallAndRespawn();

    // HUD 업데이트
    this.updateHUD();

    // 도착 문 그래픽 위치 업데이트 (골 발판 추적)
    this.updateGoalDoorGraphics();

    // 클리어 체크
    if (this.player.isOnGoalPlatform) {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.handleClear(elapsed);
    }
  }

  private updateGoalDoorGraphics() {
    if (!this.goalImage || !this.goalPlatform) return;

    // 골 발판 위치에 맞춰 이미지 위치 업데이트
    this.goalImage.setPosition(this.goalPlatform.x, this.goalPlatform.y - 45);
  }

  /**
   * 플레이어 시작 위치 계산 (디버그 모드 지원)
   */
  private getPlayerStartPosition(): { x: number; y: number } {
    const currentMapData = getMapDataForScreen(this.isMobile);
    const startIndex = DEBUG_CONFIG.START_PLATFORM_INDEX;

    // 디버그 시작 위치가 설정된 경우
    if (
      startIndex !== null &&
      startIndex >= 0 &&
      startIndex < currentMapData.length
    ) {
      const platform = currentMapData[startIndex];
      return {
        x: platform.x * this.scaleX,
        y: platform.y - 50, // 발판 위에서 시작
      };
    }

    // 기본: 0번 발판 (시작점) 위에서 시작
    const startPlatform = currentMapData[0];
    return {
      x: startPlatform.x * this.scaleX,
      y: startPlatform.y - 50,
    };
  }

  private createMap() {
    const currentMapData = getMapDataForScreen(this.isMobile);
    currentMapData.forEach((platform: PlatformData, index: number) => {
      // x 좌표와 너비를 화면 비율에 맞게 조정
      const scaledPlatform: PlatformData = {
        ...platform,
        x: platform.x * this.scaleX,
        width: platform.width ? platform.width * this.scaleX : undefined,
      };

      // platformFactory를 사용하여 발판 생성 (index 전달하여 순서 표시)
      const platformObj = createPlatformBody(this, scaledPlatform, index);

      // 생성된 발판에서 물리 바디 추출
      const bodies = extractBodiesFromPlatform(platformObj);

      // 원본 좌표와 너비 저장 (리사이즈 시 재계산용)
      // 각 바디의 실제 displayWidth를 사용 (경사면의 각 파트별 너비가 다름)
      bodies.forEach((body) => {
        this.platformBodies.push({
          body,
          originalX: body.x / this.scaleX,
          originalWidth: body.displayWidth / this.scaleX,
        });
      });

      // 얼음 발판 표시
      if (platform.texture === "platform_ice") {
        bodies.forEach((body) => {
          body.setData("isIce", true);
        });
      }

      // 골인 발판 표시 및 도착 문 생성
      if (platform.isGoal) {
        bodies.forEach((body) => {
          body.setData("isGoal", true);
        });
        if (bodies.length > 0) {
          this.goalPlatform = bodies[0];
          // 도착 문(센서) 생성 - 발판 위에 문 형태로
          this.createGoalDoor(scaledPlatform.x, scaledPlatform.y);
        }
      }

      // platforms 배열에 추가 (충돌 감지용)
      this.platforms.push(...bodies);
    });
  }

  private createWalls() {
    const wallThickness = 50;
    const screenWidth = this.scale.width;

    // 왼쪽 벽
    const leftWall = this.matter.add.rectangle(
      -wallThickness / 2,
      MAP_HEIGHT / 2,
      wallThickness,
      MAP_HEIGHT,
      {
        isStatic: true,
        label: "wall",
        friction: 0,
        frictionStatic: 0,
        restitution: 0.5,
      },
    );
    leftWall.collisionFilter = {
      category: COLLISION_CATEGORIES.WALL,
      mask: COLLISION_MASKS.WALL,
      group: 0,
    };

    // 오른쪽 벽
    const rightWall = this.matter.add.rectangle(
      screenWidth + wallThickness / 2,
      MAP_HEIGHT / 2,
      wallThickness,
      MAP_HEIGHT,
      {
        isStatic: true,
        label: "wall",
        friction: 0,
        frictionStatic: 0,
        restitution: 0.5,
      },
    );
    rightWall.collisionFilter = {
      category: COLLISION_CATEGORIES.WALL,
      mask: COLLISION_MASKS.WALL,
      group: 0,
    };
  }

  private createBirds() {
    const currentObstacleData = getObstacleDataForScreen(this.isMobile);
    currentObstacleData.forEach((data) => {
      if (data.type === "bird") {
        // x 좌표와 범위를 화면 비율에 맞게 조정
        const scaledData = {
          ...data,
          x: data.x * this.scaleX,
          range: data.range ? data.range * this.scaleX : undefined,
        };
        // scaleX를 전달하여 이동 속도도 비율에 맞게 조정
        const bird = new Bird(this, scaledData, this.scaleX);
        this.birds.push(bird);
      }
    });
  }

  private createSnowLeopards() {
    const currentSnowLeopardData = getSnowLeopardDataForScreen(this.isMobile);
    currentSnowLeopardData.forEach((data) => {
      // x 좌표와 감지 범위를 화면 비율에 맞게 조정
      const scaledData = {
        ...data,
        x: data.x * this.scaleX,
        detectRange: data.detectRange
          ? data.detectRange * this.scaleX
          : undefined,
      };
      // scaleX를 전달하여 이동 속도도 비율에 맞게 조정
      const leopard = new SnowLeopard(this, scaledData, this.scaleX);
      this.snowLeopards.push(leopard);
    });
  }

  private checkSnowLeopardFallAndRespawn() {
    const cameraY = this.cameras.main.scrollY;
    const cameraBottom = cameraY + this.cameras.main.height;

    this.snowLeopards.forEach((leopard) => {
      // 설표가 살아있는 상태에서 카메라 아래로 벗어나면 사라짐
      if (leopard.isAlive() && leopard.y > cameraBottom + 50) {
        leopard.onFellOffMap();
      }

      // 리스폰 비활성화 옵션이 켜져있으면 리스폰하지 않음
      if (DEBUG_CONFIG.DISABLE_LEOPARD_RESPAWN) {
        return;
      }

      // 설표가 죽은 상태이고, 카메라가 설표 스폰 위치에서 벗어났으면 리스폰
      // (스폰 위치가 화면 위쪽으로 벗어났을 때)
      if (leopard.isDead()) {
        const spawnY = leopard.getSpawnY();
        // 카메라 하단이 스폰 위치보다 아래에 있으면 (스폰 위치가 화면 위로 벗어남)
        if (cameraY > spawnY + 200) {
          leopard.respawn();
          leopard.setPlayerRef(this.player);
        }
      }
    });
  }

  private createGoalDoor(x: number, platformY: number) {
    // 센서 크기 (goal.png 이미지 0.5 스케일 기준)
    const sensorWidth = 30;
    const sensorHeight = 20;
    const doorY = platformY - sensorHeight / 2 - 15; // 발판 바로 위

    // 문 센서 (충돌하지 않고 감지만 함)
    this.goalDoorSensor = this.matter.add.rectangle(
      x,
      doorY,
      sensorWidth,
      sensorHeight,
      {
        isSensor: true,
        isStatic: true,
        label: "goalDoor",
        collisionFilter: {
          category: COLLISION_CATEGORIES.PLATFORM,
          mask: COLLISION_MASKS.PLATFORM,
          group: 0,
        },
      },
    );

    // goal.png 이미지 표시
    this.goalImage = this.add.image(x, platformY - 45, "goal");
    this.goalImage.setDepth(5);
    this.goalImage.setScale(0.2); // 발판 크기에 맞게 조정
  }

  private createHUD() {
    // 타이머
    this.timerText = this.add
      .text(16, 16, "TIME: 00:00", {
        fontSize: "20px",
        color: "#ffffff",
        fontFamily: "monospace",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // 높이
    this.heightText = this.add
      .text(16, 46, "HEIGHT: 0m", {
        fontSize: "20px",
        color: "#ffffff",
        fontFamily: "monospace",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // 파워 게이지 배경
    this.powerGaugeBackground = this.add.graphics();
    this.powerGaugeBackground.setScrollFactor(0);
    this.powerGaugeBackground.setDepth(100);
    this.powerGaugeBackground.setVisible(false);

    // 파워 게이지
    this.powerGauge = this.add.graphics();
    this.powerGauge.setScrollFactor(0);
    this.powerGauge.setDepth(101);
    this.powerGauge.setVisible(false);
  }

  private updateHUD() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    this.timerText.setText(
      `TIME: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    );
    this.heightText.setText(`HEIGHT: ${this.player.getHeight()}m`);
  }

  private updatePowerGauge(power: number) {
    // 게이지 표시
    this.powerGaugeBackground.setVisible(true);
    this.powerGauge.setVisible(true);

    // 현재 화면 크기 가져오기 (RESIZE 모드에서 동적으로 변함)
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;

    // 배경 그리기 (화면 하단 중앙)
    this.powerGaugeBackground.clear();
    this.powerGaugeBackground.fillStyle(0x333333, 0.8);
    this.powerGaugeBackground.fillRect(
      screenWidth / 2 - 100,
      screenHeight - 40,
      200,
      20,
    );

    // 게이지 그리기
    this.powerGauge.clear();
    const gaugeWidth = 196 * power;
    const color = power < 0.5 ? 0x00ff00 : power < 0.8 ? 0xffff00 : 0xff0000;
    this.powerGauge.fillStyle(color, 1);
    this.powerGauge.fillRect(
      screenWidth / 2 - 98,
      screenHeight - 38,
      gaugeWidth,
      16,
    );
  }

  private hidePowerGauge() {
    this.powerGaugeBackground.setVisible(false);
    this.powerGauge.setVisible(false);
  }

  private setupCollisions() {
    // 현재 충돌 중인 발판 추적
    let collidingPlatforms = new Set<Phaser.Physics.Matter.Image>();

    // 충돌 시작 이벤트
    this.matter.world.on(
      "collisionstart",
      (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;

          const playerBody = this.player.body as MatterJS.BodyType;
          if (bodyA === playerBody || bodyB === playerBody) {
            const otherBody = bodyA === playerBody ? bodyB : bodyA;

            // 도착 문 센서 감지
            if (otherBody === this.goalDoorSensor) {
              this.player.isOnGoalPlatform = true;
              return;
            }

            // 새와 충돌 감지
            if (otherBody.label === "bird") {
              const bird = this.birds.find(
                (b) => (b.body as MatterJS.BodyType) === otherBody,
              );
              if (bird) {
                // 넉백 적용 (새가 날아가는 방향으로 밀림)
                const knockbackDir = bird.getKnockbackDirection();
                this.player.applyKnockback(
                  knockbackDir,
                  GAME_CONSTANTS.BIRD_KNOCKBACK,
                );
              }
              return;
            }

            // 설표와 충돌 감지 - 게임 오버
            if (otherBody.label === "leopard") {
              const leopard = this.snowLeopards.find(
                (l) => (l.body as MatterJS.BodyType) === otherBody,
              );
              if (leopard && leopard.isAlive()) {
                this.handleGameOver();
              }
              return;
            }

            // 벽과 충돌 시 튕겨내기
            if (otherBody.label === "wall") {
              const velocity = this.player.body
                ?.velocity as Phaser.Math.Vector2;
              if (velocity) {
                // x 속도를 반전시켜 튕겨냄
                this.player.setVelocityX(-velocity.x * 0.8);
              }
              return;
            }

            const platform = this.platforms.find(
              (p) => (p.body as MatterJS.BodyType) === otherBody,
            );

            if (platform) {
              collidingPlatforms.add(platform);

              // 얼음 발판에 착지 - 플레이어 마찰력 낮춤
              if (platform.getData("isIce") === true) {
                this.currentIcePlatform = platform;
                this.player.setFrictionValue(
                  GAME_CONSTANTS.PLAYER_FRICTION_ON_ICE,
                );
              }

              // 골 판정은 문(door sensor)에서만 처리하므로 false 전달
              this.player.setGrounded(true, false);
            }
          }

          // 설표와 발판/벽 충돌 감지
          this.snowLeopards.forEach((leopard) => {
            const leopardBody = leopard.body as MatterJS.BodyType;
            if (bodyA === leopardBody || bodyB === leopardBody) {
              const otherBody = bodyA === leopardBody ? bodyB : bodyA;

              // 벽과 충돌 - 이동 멈춤
              if (otherBody.label === "wall") {
                leopard.onHitWall();
                return;
              }

              // 발판과 충돌했고, 설표가 떨어지는 중이면 착지 처리
              const platform = this.platforms.find(
                (p) => (p.body as MatterJS.BodyType) === otherBody,
              );
              if (platform && leopard.getState() === SnowLeopardState.FALLING) {
                // 발판에 착지 - 계속 추적 상태로 전환
                leopard.onLandedOnPlatform();
              }
            }
          });
        });
      },
    );

    // 지속 충돌 이벤트 - 착지 상태 유지
    this.matter.world.on(
      "collisionactive",
      (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
        let isOnIce = false;

        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;

          const playerBody = this.player.body as MatterJS.BodyType;
          if (bodyA === playerBody || bodyB === playerBody) {
            const otherBody = bodyA === playerBody ? bodyB : bodyA;

            // 도착 문 센서와 지속 충돌 - 오직 여기서만 골 처리
            if (otherBody === this.goalDoorSensor) {
              this.player.isOnGoalPlatform = true;
              return;
            }

            const platform = this.platforms.find(
              (p) => (p.body as MatterJS.BodyType) === otherBody,
            );

            if (platform) {
              collidingPlatforms.add(platform);
              if (platform.getData("isIce") === true) {
                isOnIce = true;
                this.currentIcePlatform = platform;
              }
            }
          }
        });

        // 얼음 위가 아니면 얼음 상태 해제 및 마찰력 복원
        if (!isOnIce && this.currentIcePlatform) {
          this.currentIcePlatform = null;
          this.player.resetFriction();
        }

        // 충돌 중인 발판이 있으면 착지 상태 유지 (골 판정은 문 센서에서만)
        if (collidingPlatforms.size > 0) {
          this.player.setGrounded(true, false);
        }
      },
    );

    // 충돌 종료 이벤트
    this.matter.world.on(
      "collisionend",
      (event: Phaser.Physics.Matter.Events.CollisionEndEvent) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;

          const playerBody = this.player.body as MatterJS.BodyType;
          if (bodyA === playerBody || bodyB === playerBody) {
            const otherBody = bodyA === playerBody ? bodyB : bodyA;

            // 도착 문 센서에서 벗어남
            if (otherBody === this.goalDoorSensor) {
              this.player.isOnGoalPlatform = false;
              return;
            }

            const platform = this.platforms.find(
              (p) => (p.body as MatterJS.BodyType) === otherBody,
            );

            if (platform) {
              collidingPlatforms.delete(platform);

              // 얼음 발판에서 벗어남 - 마찰력 복원
              if (platform.getData("isIce") === true) {
                this.currentIcePlatform = null;
                this.player.resetFriction();
              }
            }
          }
        });

        // 충돌 중인 발판이 없으면 공중 상태
        if (collidingPlatforms.size === 0) {
          this.player.setGrounded(false, false);
          if (this.currentIcePlatform) {
            this.currentIcePlatform = null;
            this.player.resetFriction();
          }
        }
      },
    );
  }

  private handleClear(clearTime: number) {
    this.scene.pause();
    this.scene.launch("GameOverScene", {
      success: true,
      clearTime,
      height: this.player.getHeight(),
    });
  }

  // 게임오버 처리 (표범 충돌 시 호출)
  handleGameOver() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.scene.pause();
    this.scene.launch("GameOverScene", {
      success: false,
      clearTime: elapsed,
      height: this.player.getHeight(),
    });
  }

  // 리사이즈 핸들러
  private handleResize(gameSize: Phaser.Structs.Size) {
    // 초기화 완료 전에는 무시
    if (!this.isInitialized) return;

    const width = gameSize.width;

    // 모바일 모드 변경 감지 (960px 경계)
    const newIsMobile = width <= MOBILE_BREAKPOINT;
    if (newIsMobile !== this.isMobile) {
      // 모바일 <-> 데스크톱 전환 시 게임 재시작
      this.restartGame();
      return;
    }

    // 새 스케일 팩터 계산
    const newScaleX = width / GAME_WIDTH;
    const scaleRatio = newScaleX / this.scaleX;

    // 스케일 팩터 업데이트
    this.scaleX = newScaleX;

    // 카메라 경계 업데이트 (월드 경계는 createWalls()에서 직접 관리)
    this.cameras.main.setBounds(0, 0, width, MAP_HEIGHT);

    // 배경 타일 스프라이트 크기 업데이트
    if (this.backgroundTile) {
      this.backgroundTile.setSize(width, MAP_HEIGHT);
    }

    // 발판 위치와 크기 업데이트
    this.platformBodies.forEach(({ body, originalX, originalWidth }) => {
      const newX = originalX * this.scaleX;
      const newWidth = originalWidth * this.scaleX;
      body.setPosition(newX, body.y);
      body.setDisplaySize(newWidth, body.displayHeight);
    });

    // 플레이어 x 위치도 비율에 맞게 조정
    if (this.player) {
      this.player.setPosition(this.player.x * scaleRatio, this.player.y);
      this.player.setScreenScaleX(this.scaleX);
    }

    // 새 위치와 속도 업데이트
    this.birds.forEach((bird) => {
      bird.setPosition(bird.x * scaleRatio, bird.y);
      bird.setStartX(bird.x); // 새로운 위치 기준으로 이동 범위 설정
      bird.setScreenScaleX(this.scaleX);
    });

    // 설표 위치와 속도 업데이트
    this.snowLeopards.forEach((leopard) => {
      leopard.setPosition(leopard.x * scaleRatio, leopard.y);
      leopard.setSpawnX(leopard.x); // 새로운 위치 기준으로 스폰 위치 설정
      leopard.setScreenScaleX(this.scaleX);
    });
  }

  // 게임 재시작 (모바일 <-> 데스크톱 전환 시)
  private restartGame() {
    // 현재 씬 정리 후 재시작
    this.scene.restart();
  }
}
