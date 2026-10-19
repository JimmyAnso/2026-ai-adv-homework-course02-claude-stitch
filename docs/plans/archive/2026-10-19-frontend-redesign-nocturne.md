# 前臺改版：夜園靜物（精品版）

## 目標
依 Stitch 專案「花漾生活 — 精品版前臺」的設計，改寫所有前臺 EJS 頁面，提升為高級精品花藝電商的視覺與常見版型。後台頁面不動。

## 設計 token
| 名稱 | 色碼 | 用途 |
|------|------|------|
| aubergine | #2A1A22 | 主按鈕、公告列、深色區塊、頁尾、標題 |
| porcelain | #F3F1F1 | 頁面底色 |
| driedrose | #9E4A5E | 購物車數量、錯誤、少量庫存提示 |
| moss | #56604A | 已付款、免運進度、現貨提示 |
| champagne | #C8B48A | 深色區細線 |

字型：Bodoni Moda（價格、數字）、Noto Serif TC（中文標題）、Noto Sans TC（內文）。

## 範圍
- `public/css/input.css`：新增 token 與元件 class（保留舊 token 供後台使用）
- `views/partials/head.ejs`、`views/layouts/front.ejs`、`views/partials/header.ejs`
- 新增 `views/partials/front-footer.ejs`（後台仍用 `footer.ejs`）
- 頁面：index、product-detail、cart、checkout、login、orders、order-detail、404
- JS：`header-init.js`、`notification.js` 樣式；`index.js` 每頁 8 筆；`product-detail.js` 加入「立即購買」與推薦商品；`orders.js` 提供使用者名稱
- 編輯照片存放於 `public/images/editorial/`（由 Stitch 生成）

## 原則
- 不捏造資料：API 沒有的評分、規格選項、優惠碼等不放入實作
- 保留所有 Vue 綁定與 API 行為，只改呈現
