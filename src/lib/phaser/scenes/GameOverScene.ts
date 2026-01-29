import Phaser from "phaser";

interface GameOverData {
  success: boolean;
  clearTime: number;
  height: number;
}

export default class GameOverScene extends Phaser.Scene {
  private gameResult!: GameOverData;

  constructor() {
    super("GameOverScene");
  }

  init(data: GameOverData) {
    this.gameResult = data;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 반투명 배경
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.7,
    );
    overlay.setScrollFactor(0);

    // 제목
    const titleText = this.gameResult.success ? "GOAL REACHED!" : "GAME OVER";
    const titleColor = this.gameResult.success ? "#FFD700" : "#FF4444";

    this.add
      .text(width / 2, height * 0.25, titleText, {
        fontSize: "48px",
        color: titleColor,
        fontFamily: "Mulmaru",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // 클리어 시간
    const minutes = Math.floor(this.gameResult.clearTime / 60);
    const seconds = this.gameResult.clearTime % 60;
    const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    if (this.gameResult.success) {
      this.add
        .text(width / 2, height * 0.4, `Clear Time: ${timeStr}`, {
          fontSize: "24px",
          color: "#ffffff",
          fontFamily: "Mulmaru",
        })
        .setOrigin(0.5)
        .setScrollFactor(0);
    }

    // 최대 높이
    this.add
      .text(
        width / 2,
        height * 0.48,
        `Best Height: ${this.gameResult.height}m`,
        {
          fontSize: "24px",
          color: "#ffffff",
          fontFamily: "Mulmaru",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0);

    // 버튼들
    this.createButton(width / 2, height * 0.65, "PLAY AGAIN", () => {
      this.scene.stop();
      this.scene.stop("GameScene");
      this.scene.start("GameScene");
    });

    this.createButton(width / 2, height * 0.75, "MAIN MENU", () => {
      this.scene.stop();
      this.scene.stop("GameScene");
      // Next.js 라우터로 메인 메뉴 이동
      window.location.href = "/";
    });

    // 클리어 시 점수 저장 시도
    if (this.gameResult.success) {
      this.saveScore();
    }
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
  ) {
    const BORDER = 4;
    const PAD_X = 20;
    const PAD_Y = 12;
    const BG_DEFAULT = 0x444444;
    const BG_HOVER = 0x666666;
    const BORDER_COLOR = 0x333333;

    // 텍스트 크기 측정
    const label = this.add
      .text(0, 0, text, {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Mulmaru",
      })
      .setOrigin(0.5);

    const w = label.width + PAD_X * 2;
    const h = label.height + PAD_Y * 2;
    const halfW = w / 2;
    const halfH = h / 2;

    const gfx = this.add.graphics();

    const draw = (bg: number, pressed: boolean) => {
      gfx.clear();

      // 외부 그림자 (누르지 않았을 때만)
      if (!pressed) {
        gfx.fillStyle(0x000000, 0.22);
        gfx.fillRect(-halfW, -halfH + 8, w, h);
        gfx.fillRect(-halfW + 4, -halfH + 4, w, h);
        gfx.fillRect(-halfW - 4, -halfH + 4, w, h);
      }

      // 테두리 (#333) - 모서리 비워둔 픽셀 스타일
      gfx.fillStyle(BORDER_COLOR, 1);
      gfx.fillRect(-halfW, -halfH - BORDER, w, BORDER);
      gfx.fillRect(-halfW, halfH, w, BORDER);
      gfx.fillRect(-halfW - BORDER, -halfH, BORDER, h);
      gfx.fillRect(halfW, -halfH, BORDER, h);

      // 배경
      gfx.fillStyle(bg, 1);
      gfx.fillRect(-halfW, -halfH, w, h);

      // 내부 효과
      if (pressed) {
        // 눌렸을 때: inset 그림자 (inset 0px 4px #00000038)
        gfx.fillStyle(0x000000, 0.22);
      } else {
        // 기본: 하이라이트 (inset 0px 4px #ffffff36)
        gfx.fillStyle(0xffffff, 0.21);
      }
      gfx.fillRect(-halfW, -halfH, w, BORDER);
    };

    draw(BG_DEFAULT, false);

    const container = this.add.container(x, y, [gfx, label]);
    container.setSize(w + BORDER * 2, h + BORDER * 2);
    container.setInteractive({ useHandCursor: true });

    let isHover = false;
    let isPressed = false;

    container.on("pointerover", () => {
      isHover = true;
      if (!isPressed) draw(BG_HOVER, false);
    });

    container.on("pointerout", () => {
      isHover = false;
      if (isPressed) {
        isPressed = false;
        container.setY(y);
      }
      draw(BG_DEFAULT, false);
    });

    container.on("pointerdown", () => {
      isPressed = true;
      container.setY(y + BORDER);
      draw(isHover ? BG_HOVER : BG_DEFAULT, true);
    });

    container.on("pointerup", () => {
      if (isPressed) {
        isPressed = false;
        container.setY(y);
        draw(isHover ? BG_HOVER : BG_DEFAULT, false);
        onClick();
      }
    });

    return container;
  }

  private async saveScore() {
    try {
      // localStorage에서 닉네임 가져오기
      const nickname = localStorage.getItem("goat_nickname") || "Anonymous";

      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          clear_time: this.gameResult.clearTime,
          max_height: this.gameResult.height,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Score saved, rank:", result.rank);

        // 랭크 표시
        if (result.rank) {
          this.add
            .text(
              this.scale.width / 2,
              this.scale.height * 0.55,
              `RANK #${result.rank}`,
              {
                fontSize: "32px",
                color: "#FFD700",
                fontFamily: "Mulmaru",
                stroke: "#000000",
                strokeThickness: 3,
              },
            )
            .setOrigin(0.5)
            .setScrollFactor(0);
        }
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  }
}
