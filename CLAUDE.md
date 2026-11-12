# 個人介紹網站

陳儒紘的個人網站，「一天」敘事：捲動時天色從清晨走到深夜。純靜態，HTML＋CSS＋JS，不用建置。

改版前先讀 `spec_lock.md`，想知道原因讀 `DESIGN.md`。

## 檔案
- `index.html`：全部內容。作品 10 列都是純文字，不開內頁。
- `css/style.css`、`js/main.js`：樣式與互動。
- `js/stars.js`：23:59 星點粒子，捲近才動態載入。
- `vendor/`：gsap 3.13.0、ScrollTrigger、lenis 1.3.4、rough-notation 0.5.1、three 0.160.0（MIT），全在本機，不靠 CDN。
- `tools/build_assets.py`：選照片、轉 webp、清 EXIF。`tools/build_extras.py`：分享預覽圖、小圖示、木工音效。`tools/subset_fonts.py`：改文字後要重跑。
- `_refs/motion-notes.md`：120 風格庫實測的動畫數值。
- `_refs/project-details.html`：取消的 8 個作品內頁全文，`main.before-plain-rows.js`、`style.before-plain-rows.css` 是取消前的版本。
- `_preview/`：選風格時的 4 個樣張，約 84 MB，不部署。

## 本機預覽
`python -m http.server 8933 --bind 127.0.0.1`，開 `http://127.0.0.1:8933/`。

## 進度（2026-11-05）
v1 完成並依使用者回饋改過五輪，只在本機，未部署。最後一輪實測桌機與手機 375px；減少動態模式在早期版本測過，內容調整後沒重測。

使用者已確認：菜名正確、自述句保留、電話不公開、頁尾證照區已刪、接案數字區已刪。

使用者定的規則：
- 作品 10 列只放文字：不浮圖、不開內頁。
- 圓圈游標任何地方都不顯示文字。
- 攝影區不鎖捲動，用箭頭、滑桿瀏覽。
- 料理只放首頁 6 張。

翻頁、方塊轉場與數字跳動已隨內容移除，目前只有攝影大圖用光圈轉場。

## 2026-11-12 加上
- 分享預覽：og 標籤、`assets/og.jpg`（1200×630）、小圖示。部署後 `og:image` 要改成完整網址。
- 其他作品 5 項純文字（貼圖、Claude Code 教學、股票平台、工作流啟動器、AI 影片管線），放在作品列表下方。
- 23:59 星點粒子（Three.js），捲近才載入，滑鼠可推開。
- 木工音效開關，預設關閉。
- 改這四項前的版本在 `_refs/*.before-extras`。

待決定：網域與主機。

## 同步
進度同步到 Obsidian `C:\Users\USER\ObsidianVault\個人網站製作.md`。寫 `claude/` 底下的專案筆記時用同一份內容，不要另開一份。

## 待辦完成紀錄（專案總覽）

- [x] 網域與主機待決定（2026-11-12 完成）
- [x] 減少動態模式在內容調整後沒重測（2026-11-12 完成）
