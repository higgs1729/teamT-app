/**
 * App.jsx - アプリケーションルート
 *
 * 起動時にプレイヤー名を入力させ、その後MMORPGマップ画面へ遷移する
 */

import { useState } from 'react'
import Game from './components/Game'
import './App.css'

export default function App() {
  const [playerName, setPlayerName] = useState('')
  const [started, setStarted] = useState(false)
  const [input, setInput] = useState('')

  const handleStart = () => {
    const name = input.trim() || 'Player'
    setPlayerName(name)
    setStarted(true)
  }

  if (started) {
    return <Game playerName={playerName} />
  }

  return (
    <div className="title-screen">
      <div className="title-card">
        <h1 className="title-text">⚔️ teamT World</h1>
        <p className="title-sub">見下ろし3D MMORPGプロトタイプ</p>
        <div className="name-input-group">
          <label htmlFor="pname">プレイヤー名</label>
          <input
            id="pname"
            type="text"
            value={input}
            maxLength={16}
            placeholder="名前を入力（省略可）"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            autoFocus
          />
        </div>
        <button className="start-btn" onClick={handleStart}>
          ゲームスタート
        </button>
        <p className="hint">WASD / 矢印キーで移動</p>
      </div>
    </div>
  )
}
