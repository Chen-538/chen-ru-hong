Re-read this file before generating any new component.

# spec_lock：陳儒紘個人介紹網站

2026-11-05 定案：方向 D「一天」、天色變化配色、文楷＋源石黑體、8 種動畫全上。

## 章節與天色（`data-time`／`data-bg`／`data-ink`）
| id | 時間 | 底色 | 字色 |
|---|---|---|---|
| dawn | 06:40 | #0E63C7 | #FFFFFF |
| me | 07:30 | #DCEBF7 | #10243D |
| wood | 09:00 | #EAD9BE | #2B1F12 |
| kitchen | 12:00 | #FFD79A | #3A1C08 |
| lens | 16:30 | #C2461F | #FFF3E6 |
| night | 21:00 | #0B1024 | #E4ECF8 |
| hire | 23:00 | #070B1A | #E4ECF8 |
| bye | 23:59 | #04060F | #E4ECF8 |

唯一強調色 `--sun` #F0541E，不放小字。內頁底 #FBF8F1、字 #1C2433、數字 #C2401A。
換新底色要驗字色對比 ≥ 4.5:1（目前最低是 lens 4.59）。

## 字型
| 角色 | 字型 | 檔案 |
|---|---|---|
| h1、h2、`.hand`、作品名、圖說 | 霞鶩文楷 TC Medium | `assets/fonts/wenkai.woff2` |
| 內文 | 源石黑體 TW Regular／Bold | `seki-400.woff2`、`seki-700.woff2` |
| 時鐘、數字、技術標籤 | IBM Plex Mono 500 | `plex-mono-500.woff2` |

改任何文字後跑 `python tools/subset_fonts.py`，否則新字會缺字。

## 動態數值
| 項目 | 數值 |
|---|---|
| 片頭 | 05:40→06:40 1s，上拉 .75s |
| 一般進場 | opacity＋y 24px，.85s，cubic-bezier(.22,.61,.36,1) |
| 大字逐字 | yPercent 110→0，.7s，stagger .05s；Hero .9s／.09s |
| 照片 hover | flex 或 scale，1.15s，cubic-bezier(.16,1,.3,1) |
| Hero 呼吸 | scale 1→1.05，18s 來回 |
| 光圈 | clip-path circle 0→150%，.8s，圓心為點擊座標 |
| 游標 | 12px 白點＋40px 外圈，difference；任何地方都不顯示文字 |
| 手繪線 | rough-notation 800ms，#F0541E，strokeWidth 2.5 |
| 23:59 星點 | `js/stars.js`：me-mrt.webp 取樣（桌機 150 欄、手機 96 欄），亮度 ≥ .3 才成點，邊緣隨機淡出；`#bye` top 85%→15% 聚合；滑鼠 80px 內推開；桌機放右側 25%，手機置中且畫布 opacity .5 |

`prefers-reduced-motion`：無片頭、無平滑捲動、無游標、無粒子、無星點，換頁立即切換。天色仍會變，因為那是資訊。

攝影區不用捲動鎖定（pin）：往下滑直接經過，看照片用箭頭、滑桿或手指左右滑。

作品 10 列都是純文字：hover 不浮圖、不開內頁。

Three.js 只在捲到 23:59 前 1200px 才載入；減少動態或沒有 WebGL 就不載。改 `stars.js` 後把 `main.js` 裡 `stars.js?v=N` 加一，否則瀏覽器會用舊檔。

分享預覽 `og:image` 用完整網址 https://chen-538.github.io/chen-ru-hong/assets/og.jpg；換網域時要一起改 `og:url`。圖由 `tools/build_extras.py` 產生。

## Banned
- 可見文字不用破折號。
- 標語、金句、口號式標題。改完跑 `plain-doc-copy` 的 `check_copy.py`。
- 第二個強調色、紫色漸層、Inter、Fraunces、Instrument Serif。
- 手寫字型上不加 mask、filter。
- 虛構數字、地點、心情故事。沒有出處就問使用者。
- 不放身分證、學號、校名（幼稚園）、宗教背景、鐵客松統計。
- 新增照片一律走 `tools/build_assets.py`，存檔時會清掉 EXIF 與 GPS。
- 120 風格庫的截圖、文字、插畫不進網站。
