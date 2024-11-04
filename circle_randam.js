let particles = [];
let colors;
let colorTransitionSpeed = 0.01;

function setup() {
  createCanvas(400, 400);
  frameRate(10); // フレームレートを下げて描画速度を遅く

  colors = [
    color(252, 121, 121),
    color(126, 224, 201),
    color(145, 168, 235),
    color(252, 249, 179),
  ];

  createParticles(20);
}

function draw() {
  background(255);

  // 円周に図形を配置
  drawShapesOnCircle(100, 10);
}

function createParticles(count) {
  for (let i = 0; i < count; i++) {
    let initialColorIndex = floor(random(colors.length));
    let nextColorIndex = (initialColorIndex + 1) % colors.length;

    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2),
      currentColorIndex: initialColorIndex,
      nextColorIndex: nextColorIndex,
      lerpAmount: 0,
    });
  }
}

// 図形の変化スピードを遅くし、個別に色を変化
function drawShapesOnCircle(radius, shapeCount) {
  let angleStep = TWO_PI / shapeCount;
  for (let i = 0; i < shapeCount; i++) {
    let particle = particles[i % particles.length];
    let angle = angleStep * i;
    let x = width / 2 + cos(angle) * radius;
    let y = height / 2 + sin(angle) * radius;

    // 色の遷移を個別に計算
    let currentColor = lerpColor(
      colors[particle.currentColorIndex],
      colors[particle.nextColorIndex],
      particle.lerpAmount
    );
    particle.lerpAmount += colorTransitionSpeed;

    // 色の遷移が完了したら次の色に切り替え
    if (particle.lerpAmount >= 1) {
      particle.lerpAmount = 0;
      particle.currentColorIndex = particle.nextColorIndex;
      particle.nextColorIndex = (particle.nextColorIndex + 1) % colors.length;
    }

    fill(currentColor);
    // 変化の範囲を小さくしてスムーズに
    ellipse(x, y, random(10, 80), random(10, 80));
  }
}
