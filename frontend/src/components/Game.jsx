/**
 * Game.jsx - 見下ろし3D型MMORPGマッププロトタイプ
 *
 * 機能一覧:
 *   [描画] アイソメトリックタイルマップ（プロシージャルテクスチャ貼り付け）
 *   [描画] ライティング：方向光・面ごとの受光・木の影・ビネット
 *   [描画] 水タイルのアニメーション（波紋・シマー）
 *   [操作] WASDまたは矢印キーによるプレイヤー移動
 *   [カメラ] 常にプレイヤーを中心に追従
 *   [UI] プレイヤー頭上のネームタグ・ミニマップ
 */

import { useEffect, useRef, useCallback } from 'react'

// ── タイル・移動設定 ──────────────────────────────────────
const TILE_W     = 64
const TILE_H     = 32
const TILE_DEPTH = 10   // 側面の高さ
const MAP_SIZE   = 40
const SPEED      = 5.6  // プレイヤー移動速度（スクリーン正規化済みタイル/フレーム）

const TILE = { GRASS: 0, WATER: 1, STONE: 2, DIRT: 3, TREE: 4 }

// ── ライティング設定 ──────────────────────────────────────
// 光源：左奥（アイソメトリック北西）から差し込む昼光
const LIGHT = {
  top:         1.0,   // 上面受光率（直射）
  left:        0.56,  // 左側面受光率（半影）
  right:       0.73,  // 右側面受光率（斜光）
  shadowAlpha: 0.30,  // 木の影の不透明度
}

// 側面の基本色（ライティング倍率で暗くする用）
const SIDE_BASE = {
  [TILE.GRASS]: [58,  110, 40],
  [TILE.WATER]: [30,   80, 140],
  [TILE.STONE]: [100, 102, 115],
  [TILE.DIRT]:  [120,  80,  35],
  [TILE.TREE]:  [58,  110, 40],
}

// ── マップ生成 ──────────────────────────────────────
function generateMap() {
  const map = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(TILE.GRASS))

  // 川（水）
  for (let i = 5; i < MAP_SIZE - 5; i++) {
    map[i][12] = TILE.WATER
    map[i][13] = TILE.WATER
    map[i][14] = TILE.WATER
  }

  // 石畳の道（縦横）
  for (let i = 0; i < MAP_SIZE; i++) {
    map[20][i] = TILE.STONE
    map[21][i] = TILE.STONE
    map[i][25] = TILE.STONE
    map[i][26] = TILE.STONE
  }

  // 土エリア
  for (let r = 5; r < 12; r++) {
    for (let c = 20; c < 28; c++) {
      map[r][c] = TILE.DIRT
    }
  }

  // 木をマップ全体に分散配置
  const treePos = [
    [2,2],[3,5],[5,1],[7,3],[8,8],[6,10],[9,6],
    [2,28],[4,30],[5,33],[7,31],[10,35],[3,38],[8,36],
    [15,3],[16,6],[18,1],[19,9],[17,4],
    [14,16],[13,22],[11,19],[16,28],[18,31],
    [12,36],[14,33],[17,38],
    [25,5],[28,8],[30,2],[31,6],[34,4],[36,9],[38,3],
    [27,16],[29,21],[32,18],[36,15],[38,18],
    [22,30],[26,35],[33,33],[35,28],[37,32],[38,36],[29,38],
    [3,18],[4,20],[4,22],
  ]
  for (const [r, c] of treePos) {
    if (map[r][c] === TILE.GRASS) map[r][c] = TILE.TREE
  }

  return map
}

const MAP = generateMap()

// 木タイルの座標を事前収集（毎フレームのfilterコストを排除）
const TREE_POSITIONS = []
for (let r = 0; r < MAP_SIZE; r++) {
  for (let c = 0; c < MAP_SIZE; c++) {
    if (MAP[r][c] === TILE.TREE) TREE_POSITIONS.push({ r, c })
  }
}

// ── 座標変換 ──────────────────────────────────────────
function toIso(col, row) {
  return {
    x: (col - row) * (TILE_W / 2),
    y: (col + row) * (TILE_H / 2),
  }
}

// ── シードつき乱数 ──────────────────────────────────────
function seededRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ── RGB配列 → CSS文字列 ──────────────────────────────────────
function rgb(r, g, b, a = 1) {
  return a < 1
    ? `rgba(${r},${g},${b},${a})`
    : `rgb(${r},${g},${b})`
}

// RGBに倍率を適用
function applyMult([r, g, b], m) {
  return rgb(Math.round(r * m), Math.round(g * m), Math.round(b * m))
}

// ── プロシージャルテクスチャ生成 ──────────────────────────────────────
// 各タイル種別を64×64のオフスクリーンCanvasとして事前生成する

function makeCanvas(size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  return c
}

/** 草テクスチャ：緑ベース＋ランダムな草むら */
function createGrassTexture() {
  const size = 64
  const c = makeCanvas(size)
  const ctx = c.getContext('2d')
  const rng = seededRng(1)

  ctx.fillStyle = '#5a9e3a'
  ctx.fillRect(0, 0, size, size)

  // ランダムな色ムラ（草の密度感）
  for (let i = 0; i < 350; i++) {
    const x = rng() * size
    const y = rng() * size
    const h = 90 + rng() * 30
    const s = 40 + rng() * 25
    const l = 25 + rng() * 22
    ctx.fillStyle = `hsl(${h},${s}%,${l}%)`
    ctx.fillRect(x, y, 1 + rng() * 3, 1 + rng() * 2)
  }

  // 草の葉（短いストローク）
  for (let i = 0; i < 70; i++) {
    const x = rng() * size
    const y = rng() * size
    ctx.strokeStyle = `hsla(${100 + rng() * 25}, 58%, 42%, 0.75)`
    ctx.lineWidth = 0.7
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + rng() * 2.5 - 1.2, y - 3 - rng() * 5)
    ctx.stroke()
  }

  return c
}

/** 水テクスチャ：波紋アニメーション（frameCount枚のフレーム） */
function createWaterTextures(frameCount = 10) {
  const size = 64
  const frames = []

  for (let f = 0; f < frameCount; f++) {
    const c = makeCanvas(size)
    const ctx = c.getContext('2d')
    const phase = (f / frameCount) * Math.PI * 2

    // ピクセル単位で波形生成
    const imgData = ctx.createImageData(size, size)
    const d = imgData.data
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const w1 = Math.sin(x * 0.28 + y * 0.14 + phase)
        const w2 = Math.sin(x * 0.12 - y * 0.22 + phase * 1.4)
        const w3 = Math.sin(x * 0.05 + y * 0.32 - phase * 0.7)
        const val = (w1 + w2 + w3) / 3 * 0.5 + 0.5   // [0,1]

        const i = (y * size + x) * 4
        d[i]   = 18  + Math.round(val * 55)   // R
        d[i+1] = 75  + Math.round(val * 90)   // G
        d[i+2] = 155 + Math.round(val * 70)   // B
        d[i+3] = 255
      }
    }
    ctx.putImageData(imgData, 0, 0)

    // 光のシマー（小さな白い反射）
    const rng = seededRng(f * 31 + 7)
    for (let i = 0; i < 8; i++) {
      const sx = rng() * size
      const sy = rng() * size
      const alpha = Math.max(0, Math.sin(rng() * Math.PI * 2 + phase)) * 0.55
      if (alpha > 0.08) {
        ctx.fillStyle = `rgba(210, 245, 255, ${alpha})`
        ctx.beginPath()
        ctx.ellipse(sx, sy, 3 + rng() * 7, 1.2, rng() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    frames.push(c)
  }

  return frames
}

/** 石畳テクスチャ：レンガ状の敷石パターン */
function createStoneTexture() {
  const size = 64
  const c = makeCanvas(size)
  const ctx = c.getContext('2d')
  const rng = seededRng(2)

  // 目地（モルタル）
  ctx.fillStyle = '#585a62'
  ctx.fillRect(0, 0, size, size)

  const sw = 19, sh = 13, mortar = 2
  for (let row = 0; row < Math.ceil(size / sh) + 1; row++) {
    const ox = (row % 2) * (sw / 2)
    for (let col = -1; col < Math.ceil(size / sw) + 1; col++) {
      const x = col * sw + ox + mortar / 2
      const y = row * sh + mortar / 2
      const w = sw - mortar, h = sh - mortar
      const bright = 68 + rng() * 22
      ctx.fillStyle = `hsl(225, 7%, ${bright}%)`
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 1.5)
      ctx.fill()
      // ハイライトエッジ（凸感）
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.moveTo(x + 1, y + h); ctx.lineTo(x + 1, y + 1); ctx.lineTo(x + w, y + 1)
      ctx.stroke()
      // シャドウエッジ
      ctx.strokeStyle = 'rgba(0,0,0,0.22)'
      ctx.beginPath()
      ctx.moveTo(x + w, y + 1); ctx.lineTo(x + w, y + h); ctx.lineTo(x + 1, y + h)
      ctx.stroke()
    }
  }

  return c
}

/** 土テクスチャ：粒状ノイズ＋小石 */
function createDirtTexture() {
  const size = 64
  const c = makeCanvas(size)
  const ctx = c.getContext('2d')
  const rng = seededRng(3)

  ctx.fillStyle = '#9e6228'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 450; i++) {
    const x = rng() * size, y = rng() * size
    ctx.fillStyle = `hsl(28, ${35 + rng() * 25}%, ${22 + rng() * 24}%)`
    ctx.fillRect(x, y, rng() * 3, rng() * 2.5)
  }

  // 小石
  for (let i = 0; i < 18; i++) {
    const x = rng() * size, y = rng() * size
    ctx.fillStyle = `hsl(30, 5%, ${52 + rng() * 22}%)`
    ctx.beginPath()
    ctx.ellipse(x, y, 1.5 + rng() * 2.5, 1 + rng() * 1.5, rng() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  return c
}

// ── テクスチャキャッシュ（初回描画時に遅延初期化） ──────────────────────────────────────
const TEX = { ready: false, waterFrames: [] }

function ensureTextures() {
  if (TEX.ready) return
  TEX[TILE.GRASS] = createGrassTexture()
  TEX.waterFrames  = createWaterTextures(10)
  TEX[TILE.WATER]  = TEX.waterFrames[0]
  TEX[TILE.STONE]  = createStoneTexture()
  TEX[TILE.DIRT]   = createDirtTexture()
  TEX[TILE.TREE]   = TEX[TILE.GRASS]   // 木タイルの地面は草
  TEX.ready = true
}

// ── アイソメトリック上面へのテクスチャ貼り付け ──────────────────────────────────────
// テクスチャ座標(u,v)をダイアモンド形上面に変換するアフィン行列を適用してdrawImageする
//
// 変換式: u=(0,0)→左頂点, u=(TEX,0)→上頂点, u=(0,TEX)→下頂点, u=(TEX,TEX)→右頂点
// a=hw/TEX, b=-hh/TEX, c=hw/TEX, d=hh/TEX, e=sx-hw, f=sy+hh
function blitTopFace(ctx, sx, sy, texture) {
  const hw = TILE_W / 2, hh = TILE_H / 2
  const ts = texture.width

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(sx,      sy)
  ctx.lineTo(sx + hw, sy + hh)
  ctx.lineTo(sx,      sy + TILE_H)
  ctx.lineTo(sx - hw, sy + hh)
  ctx.closePath()
  ctx.clip()

  ctx.transform(hw / ts, -hh / ts, hw / ts, hh / ts, sx - hw, sy + hh)
  ctx.drawImage(texture, 0, 0)
  ctx.restore()
}

// ── タイル側面の描画（グラデーション＋ライティング） ──────────────────────────────────────
function drawSides(ctx, sx, sy, base) {
  const hw = TILE_W / 2, hh = TILE_H / 2

  // 左側面
  const lg = ctx.createLinearGradient(sx - hw, sy + hh, sx - hw, sy + hh + TILE_DEPTH)
  lg.addColorStop(0, applyMult(base, LIGHT.left))
  lg.addColorStop(1, applyMult(base, LIGHT.left * 0.72))
  ctx.beginPath()
  ctx.moveTo(sx - hw, sy + hh)
  ctx.lineTo(sx,      sy + TILE_H)
  ctx.lineTo(sx,      sy + TILE_H + TILE_DEPTH)
  ctx.lineTo(sx - hw, sy + hh + TILE_DEPTH)
  ctx.closePath()
  ctx.fillStyle = lg
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  // 右側面
  const rg = ctx.createLinearGradient(sx + hw, sy + hh, sx + hw, sy + hh + TILE_DEPTH)
  rg.addColorStop(0, applyMult(base, LIGHT.right))
  rg.addColorStop(1, applyMult(base, LIGHT.right * 0.72))
  ctx.beginPath()
  ctx.moveTo(sx,      sy + TILE_H)
  ctx.lineTo(sx + hw, sy + hh)
  ctx.lineTo(sx + hw, sy + hh + TILE_DEPTH)
  ctx.lineTo(sx,      sy + TILE_H + TILE_DEPTH)
  ctx.closePath()
  ctx.fillStyle = rg
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'
  ctx.stroke()
}

// ── タイル全体の描画 ──────────────────────────────────────
function drawTile(ctx, sx, sy, tile, tick) {
  const hw = TILE_W / 2, hh = TILE_H / 2

  if (tile === TILE.WATER) {
    // 水はアニメーションフレームを使用（6tickごとに切り替え）
    const fi = Math.floor(tick / 6) % TEX.waterFrames.length
    blitTopFace(ctx, sx, sy, TEX.waterFrames[fi])
    // 水は側面なし＋上面エッジのみ
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(sx, sy); ctx.lineTo(sx + hw, sy + hh)
    ctx.lineTo(sx, sy + TILE_H); ctx.lineTo(sx - hw, sy + hh)
    ctx.closePath()
    ctx.strokeStyle = 'rgba(20,60,120,0.4)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()
    return
  }

  // テクスチャ貼り付け
  const tex = TEX[tile]
  if (tex) blitTopFace(ctx, sx, sy, tex)

  // 上面エッジを微暗化（タイル輪郭を見やすくするAO風処理）
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(sx, sy); ctx.lineTo(sx + hw, sy + hh)
  ctx.lineTo(sx, sy + TILE_H); ctx.lineTo(sx - hw, sy + hh)
  ctx.closePath()
  ctx.clip()
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()

  drawSides(ctx, sx, sy, SIDE_BASE[tile])
}

// ── 木の影描画（タイル描画後、木スプライト描画前に呼ぶ） ──────────────────────────────────────
// 光源が左奥なので影は右手前（screenX右、screenY下）に伸びる
function drawTreeShadow(ctx, sx, sy) {
  ctx.save()
  ctx.globalAlpha = LIGHT.shadowAlpha
  ctx.fillStyle = '#001008'
  ctx.beginPath()
  // 楕円を右手前に傾けて影を表現
  ctx.ellipse(sx + TILE_W * 0.32, sy + TILE_H * 1.05, 22, 9, Math.PI / 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.restore()
}

// ── 木スプライト描画 ──────────────────────────────────────
// screenX/Y はタイル上面左頂点。幹の根元をタイル上面の中心（sy + TILE_H/2）から生やす
function drawTree(ctx, sx, sy) {
  const bx = sx
  const by = sy + TILE_H / 2   // タイル上面中心Y（幹の根元）

  // 幹
  ctx.fillStyle = '#6b3d11'
  ctx.fillRect(bx - 4, by - 20, 8, 20)

  // 葉（重ねた3つの円で立体感を出す）
  ctx.beginPath(); ctx.arc(bx,     by - 36, 20, 0, Math.PI * 2)
  ctx.fillStyle = '#2d7a1a'; ctx.fill()
  ctx.beginPath(); ctx.arc(bx - 10, by - 46, 14, 0, Math.PI * 2)
  ctx.fillStyle = '#3a9022'; ctx.fill()
  ctx.beginPath(); ctx.arc(bx + 10, by - 44, 14, 0, Math.PI * 2)
  ctx.fillStyle = '#3a9022'; ctx.fill()
  ctx.beginPath(); ctx.arc(bx,      by - 56, 15, 0, Math.PI * 2)
  ctx.fillStyle = '#45a828'; ctx.fill()

  // 葉ハイライト（光源側・左奥）
  ctx.beginPath(); ctx.arc(bx - 6, by - 48, 6, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(100,220,60,0.35)'; ctx.fill()
}

// ── プレイヤー描画（Among Usスタイル） ──────────────────────────────────────
function drawPlayer(ctx, sx, sy, name, color = '#e63946') {
  const bx = sx
  const by = sy - 24

  ctx.fillStyle = color
  ctx.beginPath(); ctx.roundRect(bx - 10, by, 20, 22, 6); ctx.fill()
  ctx.beginPath(); ctx.arc(bx, by - 8, 12, 0, Math.PI * 2); ctx.fill()

  // バイザー
  ctx.fillStyle = 'rgba(120,200,255,0.85)'
  ctx.beginPath(); ctx.ellipse(bx + 3, by - 10, 8, 6, 0.3, 0, Math.PI * 2); ctx.fill()

  // リュック
  ctx.fillStyle = '#555'
  ctx.beginPath(); ctx.roundRect(bx - 14, by + 4, 6, 12, 3); ctx.fill()

  // 足
  ctx.fillStyle = color
  ctx.beginPath(); ctx.roundRect(bx - 9, by + 20, 7, 8, 3); ctx.fill()
  ctx.beginPath(); ctx.roundRect(bx + 2,  by + 20, 7, 8, 3); ctx.fill()

  // ネームタグ
  const nameY = by - 28
  ctx.font = 'bold 12px sans-serif'
  const tw = ctx.measureText(name).width
  ctx.fillStyle = 'rgba(0,0,0,0.58)'
  ctx.beginPath(); ctx.roundRect(bx - tw / 2 - 6, nameY - 13, tw + 12, 18, 4); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(name, bx, nameY - 4)
}

// ── ミニマップ ──────────────────────────────────────
function drawMinimap(ctx, px, py, W, H) {
  const mm = 120, mx = W - mm - 12, my = 12, scale = mm / MAP_SIZE

  ctx.save()
  ctx.globalAlpha = 0.86
  ctx.fillStyle = '#0a1a0a'
  ctx.strokeStyle = '#4a7a4a'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.roundRect(mx - 2, my - 2, mm + 4, mm + 4, 4); ctx.fill(); ctx.stroke()

  for (let r = 0; r < MAP_SIZE; r++) {
    for (let c = 0; c < MAP_SIZE; c++) {
      const t = MAP[r][c]
      ctx.fillStyle =
        t === TILE.WATER ? '#3a7fd5' :
        t === TILE.STONE ? '#9e9e9e' :
        t === TILE.DIRT  ? '#b5813b' :
        t === TILE.TREE  ? '#2d7a1a' : '#5a9e3a'
      ctx.fillRect(mx + c * scale, my + r * scale, scale + 0.5, scale + 0.5)
    }
  }

  ctx.fillStyle = '#ff4444'
  ctx.beginPath(); ctx.arc(mx + px * scale, my + py * scale, 3, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1
  ctx.restore()
}

// ── メインコンポーネント ──────────────────────────────────────
export default function Game({ playerName = 'Player1' }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef({ px: 22.5, py: 22.5, keys: {}, tick: 0 })
  const rafRef    = useRef(null)

  const isWalkable = useCallback((col, row) => {
    const c = Math.floor(col), r = Math.floor(row)
    if (c < 0 || r < 0 || c >= MAP_SIZE || r >= MAP_SIZE) return false
    const t = MAP[r][c]
    return t !== TILE.WATER && t !== TILE.TREE
  }, [])

  const loop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    ensureTextures()

    const ctx = canvas.getContext('2d')
    const { keys } = stateRef.current
    let { px, py, tick } = stateRef.current

    // ── 移動処理 ──────────────────────────────────────
    // 入力方向をスクリーン空間で正規化してからワールド座標に逆変換することで
    // 横(TILE_W/2) と縦(TILE_H/2) の比率差による速度差を補正する
    const up    = keys['ArrowUp']    || keys['w'] || keys['W'] || keys['KeyW']
    const down  = keys['ArrowDown']  || keys['s'] || keys['S'] || keys['KeyS']
    const left  = keys['ArrowLeft']  || keys['a'] || keys['A'] || keys['KeyA']
    const right = keys['ArrowRight'] || keys['d'] || keys['D'] || keys['KeyD']

    let mc = 0, mr = 0
    if (up)    { mc -= 1; mr -= 1 }
    if (down)  { mc += 1; mr += 1 }
    if (left)  { mc -= 1; mr += 1 }
    if (right) { mc += 1; mr -= 1 }

    const hw = TILE_W / 2, hh = TILE_H / 2
    const svx = (mc - mr) * hw
    const svy = (mc + mr) * hh
    const slen = Math.sqrt(svx * svx + svy * svy)
    if (slen > 0) {
      const snvx = svx / slen
      const snvy = svy / slen
      const dx = (snvx / hw + snvy / hh) / 2
      const dy = (snvy / hh - snvx / hw) / 2
      const nx = px + dx * SPEED
      const ny = py + dy * SPEED
      if (isWalkable(nx, py)) px = nx
      if (isWalkable(px, ny)) py = ny
    }

    stateRef.current.px   = px
    stateRef.current.py   = py
    stateRef.current.tick = tick + 1

    // ── 描画 ──────────────────────────────────────
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // 背景：空（昼の大気グラデーション）
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, '#1c3d5a')
    sky.addColorStop(1, '#2a5a3a')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    // カメラ：プレイヤーを画面中央に固定
    const pi = toIso(px, py)
    const camX = W / 2 - pi.x
    const camY = H / 2 - pi.y - TILE_H / 2

    ctx.save()
    ctx.translate(camX, camY)

    // 表示範囲内タイルをZオーダー昇順でソート
    const tiles = []
    for (let r = 0; r < MAP_SIZE; r++) {
      for (let c = 0; c < MAP_SIZE; c++) {
        const iso = toIso(c, r)
        const sx = iso.x + camX, sy = iso.y + camY
        if (sx < -TILE_W || sx > W + TILE_W || sy < -TILE_H * 4 || sy > H + TILE_DEPTH * 2) continue
        tiles.push({ r, c, iso, tile: MAP[r][c] })
      }
    }
    tiles.sort((a, b) => (a.r + a.c) - (b.r + b.c))

    // パス1: 地面タイルを全て描画（木タイルも地面部分のみここで描く）
    // 地面は常に最下層（プレイヤー・木より必ず先に描く）
    for (const { iso, tile } of tiles) {
      drawTile(ctx, iso.x, iso.y, tile, tick)
    }

    // パス2: オブジェクト層（木スプライト＋プレイヤー）をZ値でソートして1パスで描画
    // 木のZに+1オフセット：枝葉が上方向に視覚的に広がるため、手前判定をずらす
    const playerZ = px + py
    const pIso    = toIso(px, py)

    // 可視タイルに絞った木のみを対象にする
    const visibleTreeSet = new Set(tiles.filter(t => t.tile === TILE.TREE).map(t => `${t.r},${t.c}`))
    const objects = TREE_POSITIONS
      .filter(({ r, c }) => visibleTreeSet.has(`${r},${c}`))
      .map(({ r, c }) => {
        const iso = toIso(c, r)
        return { z: r + c + 1, draw: () => { drawTreeShadow(ctx, iso.x, iso.y); drawTree(ctx, iso.x, iso.y) } }
      })
    objects.push({ z: playerZ, draw: () => drawPlayer(ctx, pIso.x, pIso.y, playerName) })
    objects.sort((a, b) => a.z - b.z)

    for (const obj of objects) obj.draw()

    ctx.restore()

    // ── 後処理エフェクト ──────────────────────────────────────

    // ビネット（画面周辺を暗くして映画的な奥行き感を演出）
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.82)
    vig.addColorStop(0, 'rgba(0,0,0,0)')
    vig.addColorStop(1, 'rgba(0,0,0,0.58)')
    ctx.fillStyle = vig
    ctx.fillRect(0, 0, W, H)

    // グローバルカラーグレーディング（暖色の昼光雰囲気）
    ctx.fillStyle = 'rgba(255,235,180,0.04)'
    ctx.fillRect(0, 0, W, H)

    drawMinimap(ctx, px, py, W, H)

    rafRef.current = requestAnimationFrame(loop)
  }, [playerName, isWalkable])

  useEffect(() => {
    const onKeyDown = (e) => {
      stateRef.current.keys[e.key]  = true
      stateRef.current.keys[e.code] = true  // 'KeyW','KeyA','KeyS','KeyD' でも受け取る
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault()
    }
    const onKeyUp = (e) => {
      stateRef.current.keys[e.key]  = false
      stateRef.current.keys[e.code] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    rafRef.current = requestAnimationFrame(loop)
    return () => { ro.disconnect(); cancelAnimationFrame(rafRef.current) }
  }, [loop])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a2e1a', overflow: 'hidden', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        background: 'rgba(0,0,0,0.62)', color: '#ccc',
        padding: '8px 14px', borderRadius: 8,
        fontSize: 13, lineHeight: 1.7,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <strong style={{ color: '#fff' }}>操作方法</strong><br />
        WASD / 矢印キー：移動
      </div>
    </div>
  )
}
