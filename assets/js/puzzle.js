// ==================================================
// マイコン通信
// ==================================================

const connectSerialBtn = document.getElementById('connectSerialBtn');
const serialStatus = document.getElementById('serialStatus');

let serialPort = null;
let serialReader = null;

// マイコンから受け取ったフレームの角度
let frameAngle = 0;

// 90度単位へ吸着させる範囲
const SNAP_ANGLE_RANGE = 30;

function getSnappedAngle(angle) {
  const nearestAngle = Math.round(angle / 90) * 90;

  if (Math.abs(angle - nearestAngle) <= SNAP_ANGLE_RANGE) {
    return nearestAngle;
  }

  return angle;
}

function handleSerialLine(line) {
  line = line.trim();
  const parts = line.split(',');

  // ANGLE,xx.x 以外は無視
  if (parts[0] !== 'ANGLE' || parts.length < 2) {
    return;
  }

  const receivedAngle = Number(parts[1]);

  if (Number.isNaN(receivedAngle)) {
    return;
  }

  // マイコンと画面上の回転方向を合わせる
  frameAngle = -getSnappedAngle(receivedAngle);

  console.log(
    `受信角度: ${receivedAngle}° / フレーム角度: ${frameAngle}°`
  );

  draw();
}

async function connectSerial() {
  try {
    if (!('serial' in navigator)) {
      serialStatus.textContent = 'Web Serial APIに対応していません';
      return;
    }

    serialPort = await navigator.serial.requestPort();

    await serialPort.open({
      baudRate: 115200
    });

    serialStatus.textContent = '接続済み';

    readSerialData();

  } catch (error) {
    console.error('シリアル接続エラー:', error);
    serialStatus.textContent = '接続失敗';
  }
}

async function readSerialData() {
  const decoder = new TextDecoderStream();

  serialPort.readable.pipeTo(decoder.writable);

  serialReader = decoder.readable.getReader();

  let buffer = '';

  try {
    while (true) {
      const { value, done } = await serialReader.read();

      if (done) {
        break;
      }

      buffer += value;

      const lines = buffer.split('\n');

      buffer = lines.pop();

      for (const line of lines) {
        handleSerialLine(line);
      }
    }

  } catch (error) {
    console.error('シリアル受信エラー:', error);

  } finally {
    serialReader.releaseLock();
  }
}

if (connectSerialBtn) {
  connectSerialBtn.addEventListener('click', connectSerial);
}



// ==================================================
// パズル設定
// ==================================================

const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const messageEl = document.getElementById('message');

const urlParams = new URLSearchParams(window.location.search);
const gridParam = urlParams.get('grid') || '2*2';

const [colsParsed, rowsParsed] = gridParam.split('*').map(Number);
const COLS = colsParsed || 2;
const ROWS = rowsParsed || 2;

const h1El = document.getElementById('puzzleTitle') || document.querySelector('h1');

if (h1El) {
  h1El.textContent = `ジグソーパズル (${COLS}×${ROWS})`;
}

canvas.width = 1000;
canvas.height = 530;

const PUZZLE_WIDTH = 600;
const PUZZLE_HEIGHT = 400;

const frameOffsetX = (canvas.width - PUZZLE_WIDTH) / 2;
const frameOffsetY = (canvas.height - PUZZLE_HEIGHT) / 2;

const pieceWidth = PUZZLE_WIDTH / COLS;
const pieceHeight = PUZZLE_HEIGHT / ROWS;
const SNAP_DISTANCE = 30;

let pieces = [];
let selectedPiece = null;
let dragOffsetX = 0;
let dragOffsetY = 0;



// ==================================================
// ランダム画像
// ==================================================

const randomImages = [
  'https://picsum.photos/id/1015/600/400',
  'https://picsum.photos/id/1018/600/400',
  'https://picsum.photos/id/1025/600/400',
  'https://picsum.photos/id/1039/600/400',
  'https://picsum.photos/id/1043/600/400'
];

const img = new Image();
img.src = randomImages[Math.floor(Math.random() * randomImages.length)];
img.crossOrigin = 'Anonymous';

img.onload = () => {
  initPuzzle();
  draw();
};



// ==================================================
// パズルの形状
// ==================================================

function generateEdges(rows, cols) {
  let hEdges = [];

  for (let r = 0; r <= rows; r++) {
    hEdges[r] = [];

    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows) {
        hEdges[r][c] = 0;
      } else {
        hEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
      }
    }
  }

  let vEdges = [];

  for (let r = 0; r < rows; r++) {
    vEdges[r] = [];

    for (let c = 0; c <= cols; c++) {
      if (c === 0 || c === cols) {
        vEdges[r][c] = 0;
      } else {
        vEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
      }
    }
  }

  return { hEdges, vEdges };
}



// ==================================================
// パズルの初期化
// ==================================================

function initPuzzle() {
  pieces = [];

  const { hEdges, vEdges } = generateEdges(ROWS, COLS);

  const angles = [0, 90, 180, 270];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const sx = c * pieceWidth;
      const sy = r * pieceHeight;

      const correctX = frameOffsetX + sx;
      const correctY = frameOffsetY + sy;

      const { x: initX, y: initY } = getRandomOutsidePosition();

      const randomAngle = angles[Math.floor(Math.random() * angles.length)];

      const edges = [
        -hEdges[r][c],
        vEdges[r][c + 1],
        hEdges[r + 1][c],
        -vEdges[r][c]
      ];

      pieces.push({
        row: r,
        col: c,
        sx: sx,
        sy: sy,
        x: initX,
        y: initY,
        angle: randomAngle,
        correctX: correctX,
        correctY: correctY,
        edges: edges,
        isLocked: false,

        // はめ込んだときのフレーム角度
        lockedFrameAngle: 0
      });
    }
  }
}



// ==================================================
// ピースの初期位置
// ==================================================

function getRandomOutsidePosition() {
  const zone = Math.floor(Math.random() * 4);
  let x, y;

  switch (zone) {
    case 0:
      x = Math.random() * (canvas.width - pieceWidth);
      y = Math.random() * Math.max(0, frameOffsetY - pieceHeight);
      break;

    case 1:
      x = Math.random() * (canvas.width - pieceWidth);
      y = frameOffsetY + PUZZLE_HEIGHT + Math.random() * Math.max(
        0,
        canvas.height - (frameOffsetY + PUZZLE_HEIGHT) - pieceHeight
      );
      break;

    case 2:
      x = Math.random() * Math.max(0, frameOffsetX - pieceWidth);
      y = Math.random() * (canvas.height - pieceHeight);
      break;

    case 3:
      x = frameOffsetX + PUZZLE_WIDTH + Math.random() * Math.max(
        0,
        canvas.width - (frameOffsetX + PUZZLE_WIDTH) - pieceWidth
      );
      y = Math.random() * (canvas.height - pieceHeight);
      break;
  }

  x = Math.max(0, Math.min(x, canvas.width - pieceWidth));
  y = Math.max(0, Math.min(y, canvas.height - pieceHeight));

  return { x, y };
}



// ==================================================
// フレームの向きを考慮した正解位置
// ==================================================

function getCorrectPosition(p) {
  const frameCenterX = frameOffsetX + PUZZLE_WIDTH / 2;
  const frameCenterY = frameOffsetY + PUZZLE_HEIGHT / 2;

  const pieceCenterX = p.correctX + pieceWidth / 2;
  const pieceCenterY = p.correctY + pieceHeight / 2;

  const angle = frameAngle * Math.PI / 180;

  const dx = pieceCenterX - frameCenterX;
  const dy = pieceCenterY - frameCenterY;

  const rotatedCenterX =
    frameCenterX + dx * Math.cos(angle) - dy * Math.sin(angle);

  const rotatedCenterY =
    frameCenterY + dx * Math.sin(angle) + dy * Math.cos(angle);

  return {
    x: rotatedCenterX - pieceWidth / 2,
    y: rotatedCenterY - pieceHeight / 2
  };
}



// ==================================================
// はめ込まれたピースの位置をフレーム回転に追従させる
// ==================================================

function getLockedPieceTransform(p) {
  const frameCenterX = frameOffsetX + PUZZLE_WIDTH / 2;
  const frameCenterY = frameOffsetY + PUZZLE_HEIGHT / 2;

  const pieceCenterX = p.x + pieceWidth / 2;
  const pieceCenterY = p.y + pieceHeight / 2;

  const rotation =
    (frameAngle - p.lockedFrameAngle) * Math.PI / 180;

  const dx = pieceCenterX - frameCenterX;
  const dy = pieceCenterY - frameCenterY;

  const rotatedCenterX =
    frameCenterX +
    dx * Math.cos(rotation) -
    dy * Math.sin(rotation);

  const rotatedCenterY =
    frameCenterY +
    dx * Math.sin(rotation) +
    dy * Math.cos(rotation);

  return {
    x: rotatedCenterX,
    y: rotatedCenterY,
    angle: p.angle + (frameAngle - p.lockedFrameAngle)
  };
}



// ==================================================
// ピースの輪郭
// ==================================================

function drawEdge(ctx, x1, y1, x2, y2, tabType) {
  if (tabType === 0) {
    ctx.lineTo(x2, y2);
    return;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);

  const nx = (-dy / length) * tabType;
  const ny = (dx / length) * tabType;

  const tabSize = length * 0.2;

  const p = (u, v) => ({
    x: x1 + dx * u + nx * v * tabSize,
    y: y1 + dy * u + ny * v * tabSize
  });

  const base1 = p(0.35, 0);
  ctx.lineTo(base1.x, base1.y);

  const cp1 = p(0.35, 0.6);
  const cp2 = p(0.40, 1.0);
  const top = p(0.50, 1.0);
  const cp3 = p(0.60, 1.0);
  const cp4 = p(0.65, 0.6);
  const base2 = p(0.65, 0);

  ctx.bezierCurveTo(
    cp1.x, cp1.y,
    cp2.x, cp2.y,
    top.x, top.y
  );

  ctx.bezierCurveTo(
    cp3.x, cp3.y,
    cp4.x, cp4.y,
    base2.x, base2.y
  );

  ctx.lineTo(x2, y2);
}

function createPiecePath(ctx, x, y, w, h, edges) {
  ctx.beginPath();
  ctx.moveTo(x, y);

  drawEdge(ctx, x, y, x + w, y, edges[0]);
  drawEdge(ctx, x + w, y, x + w, y + h, edges[1]);
  drawEdge(ctx, x + w, y + h, x, y + h, edges[2]);
  drawEdge(ctx, x, y + h, x, y, edges[3]);

  ctx.closePath();
}



// ==================================================
// 描画処理
// ==================================================

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Canvas全体の外枠
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  const frameCenterX = frameOffsetX + PUZZLE_WIDTH / 2;
  const frameCenterY = frameOffsetY + PUZZLE_HEIGHT / 2;

  // ==================================================
  // フレーム
  // ==================================================

  ctx.save();

  ctx.translate(frameCenterX, frameCenterY);
  ctx.rotate((frameAngle * Math.PI) / 180);
  ctx.translate(-frameCenterX, -frameCenterY);

  // パズル受け皿
  ctx.fillStyle = '#eaeaea';
  ctx.fillRect(
    frameOffsetX,
    frameOffsetY,
    PUZZLE_WIDTH,
    PUZZLE_HEIGHT
  );

  // フレーム外周
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 8;
  ctx.strokeRect(
    frameOffsetX,
    frameOffsetY,
    PUZZLE_WIDTH,
    PUZZLE_HEIGHT
  );

  // 受け皿のガイド線
  pieces.forEach(p => {
    ctx.save();

    createPiecePath(
      ctx,
      p.correctX,
      p.correctY,
      pieceWidth,
      pieceHeight,
      p.edges
    );

    ctx.strokeStyle = '#b5b5b5';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  });

  // ==================================================
  // フレームの向きを示す矢印
  // ==================================================

  const arrowX = frameCenterX;
  const arrowY = frameOffsetY - 25;

  ctx.save();

  ctx.translate(arrowX, arrowY);

  ctx.rotate((frameAngle * Math.PI) / 180);

  ctx.fillStyle = '#555';
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 3;

  // 矢印の棒
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(0, -10);
  ctx.stroke();

  // 矢印の先端
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(-8, -7);
  ctx.lineTo(8, -7);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  ctx.restore();



  // ==================================================
  // ピースの描画
  // ==================================================

  pieces.forEach(p => {
    ctx.save();

    let drawX = p.x;
    let drawY = p.y;
    let drawAngle = p.angle;

    // はめ込まれたピースはフレームの回転に追従
    if (p.isLocked) {
      const transform = getLockedPieceTransform(p);

      drawX = transform.x - pieceWidth / 2;
      drawY = transform.y - pieceHeight / 2;
      drawAngle = transform.angle;
    }

    const centerX = drawX + pieceWidth / 2;
    const centerY = drawY + pieceHeight / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate((drawAngle * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // パズル形状で切り抜き
    createPiecePath(
      ctx,
      drawX,
      drawY,
      pieceWidth,
      pieceHeight,
      p.edges
    );

    ctx.clip();

    // 元画像の描画
    ctx.drawImage(
      img,
      drawX - p.sx,
      drawY - p.sy,
      PUZZLE_WIDTH,
      PUZZLE_HEIGHT
    );

    ctx.restore();

    // ピースの輪郭線
    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate((drawAngle * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    createPiecePath(
      ctx,
      drawX,
      drawY,
      pieceWidth,
      pieceHeight,
      p.edges
    );

    ctx.strokeStyle = p.isLocked ? '#4CAF50' : '#333';
    ctx.lineWidth = p.isLocked ? 2 : 1.5;
    ctx.stroke();

    ctx.restore();
  });
}



// ==================================================
// マウス操作
// ==================================================

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// ピースの回転操作は無効
// canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
  const pos = getMousePos(e);

  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];

    if (
      !p.isLocked &&
      pos.x >= p.x - 10 &&
      pos.x <= p.x + pieceWidth + 10 &&
      pos.y >= p.y - 10 &&
      pos.y <= p.y + pieceHeight + 10
    ) {

      // ピースの回転操作は行わない
      // if (e.button === 2) {
      //   p.angle = (p.angle + 90) % 360;
      //   draw();
      //   return;
      // }

      selectedPiece = p;

      dragOffsetX = pos.x - p.x;
      dragOffsetY = pos.y - p.y;

      pieces.splice(i, 1);
      pieces.push(selectedPiece);

      break;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!selectedPiece) return;

  const pos = getMousePos(e);

  selectedPiece.x = pos.x - dragOffsetX;
  selectedPiece.y = pos.y - dragOffsetY;

  draw();
});

canvas.addEventListener('mouseup', () => {
  if (!selectedPiece) return;

  const correctPosition = getCorrectPosition(selectedPiece);

  const dist = Math.hypot(
    selectedPiece.x - correctPosition.x,
    selectedPiece.y - correctPosition.y
  );

  // 正しい位置なら、その時のフレーム角度を記録して吸着
  if (dist < SNAP_DISTANCE) {
    selectedPiece.x = correctPosition.x;
    selectedPiece.y = correctPosition.y;

    // はめ込んだ瞬間のフレーム角度を記録
    selectedPiece.lockedFrameAngle = frameAngle;

    selectedPiece.isLocked = true;
  }

  selectedPiece = null;

  draw();
  checkCompletion();
});



// ==================================================
// 完成判定
// ==================================================

function checkCompletion() {
  const isComplete = pieces.every(p => p.isLocked);

  if (isComplete) {
    messageEl.textContent = '🎉 パズル完成！おめでとうございます！';
  }
}



// ==================================================
// ボタン操作
// ==================================================

const restartBtn = document.getElementById('restartBtn');

if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    messageEl.textContent = '';
    frameAngle = 0;
    initPuzzle();
    draw();
  });
}

const backBtn = document.getElementById('backBtn');

if (backBtn) {
  backBtn.addEventListener('click', () => {
    window.location.href = 'pages/select.html';
  });
}
