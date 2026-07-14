## 終了処理 (本番ビルド時は'*'を具体的なURlに差し替える)
window.parent.postMessage({ type: 'game:ended',coin: 'コイン枚数'}, '*');
coinについて、0ならゲームオーバー、1以上でクリアと判定する。