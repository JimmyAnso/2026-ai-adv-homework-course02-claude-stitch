# 更新日誌

所有重大變更皆記錄於此文件。格式參考 [Keep a Changelog](https://keepachangelog.com/)。

## [Unreleased]

### Fixed
- 訂單時間顯示少 8 小時：SQLite 存的 UTC 時間未帶時區，前台訂單詳情、我的訂單與後台訂單管理改用 `api.js` 的 `formatDate` / `formatDateTime`，以台北時間顯示

### Added
- 綠界 ECPay AIO 金流串接：結帳後導向綠界付款頁面完成真實付款流程
- 新增 `src/utils/ecpay.js` 工具模組：CheckMacValue 簽章產生/驗證、ECPay 專用 URL 編碼、QueryTradeInfo API 查詢
- 新增 `GET /ecpay/payment/:orderId` 頁面路由：產生自動送出的 ECPay 付款表單
- 新增 `POST /api/orders/:id/check-payment` API：透過 QueryTradeInfo API 主動查詢付款狀態（取代本地端無法接收的 Server Notify）
- 訂單新增 `merchant_trade_no` 欄位：對應綠界 MerchantTradeNo，由 order_no 去除連字號產生

### Changed
- 前臺全面改版「夜園靜物」精品風格（設計稿：Stitch 專案「花漾生活 — 精品版前臺」）：
  - 新配色 token（aubergine / porcelain / driedrose / moss / champagne）與 Bodoni Moda、Noto Serif TC 字型；元件 class（`.btn`、`.field`、`.panel` 等）定義於 `public/css/input.css`
  - 新增頂部公告列、置中商標導覽列、多欄頁尾（`views/partials/front-footer.ejs`，後台仍沿用 `footer.ejs`）
  - 首頁：暗調靜物主視覺、分類磚、商品格（實心「加入購物車」按鈕、庫存徽章）、鮮花訂閱區、品牌承諾、顧客評價、電子報區塊；每頁改為 8 筆商品
  - 商品詳情：新增「立即購買」（加入購物車後前往購物車）與「你可能也會喜歡」推薦區
  - 購物車／結帳：結帳步驟指示、免運進度條、表格式品項列表
  - 我的訂單：會員側欄與狀態篩選分頁；訂單詳情：狀態橫幅與進度條
  - 登入／註冊、404 頁改為圖文分割與全版靜物圖
  - 編輯用照片存放於 `public/images/editorial/`
- 結帳頁面（checkout.js）：送出訂單後導向綠界付款頁面，不再直接跳轉訂單詳情
- 訂單詳情頁面（order-detail.ejs / order-detail.js）：原「付款成功/失敗」模擬按鈕改為「查詢付款狀態」與「前往付款」按鈕；從綠界導回時自動觸發付款狀態查詢

## [1.0.0] - 2026-04-12

### 新增
- 使用者註冊、登入、個人資料 API
- 商品列表與詳情 API（公開）
- 購物車 CRUD API（雙模式認證：JWT / X-Session-Id）
- 訂單建立、查詢、模擬付款 API
- 後台商品管理 API（CRUD）
- 後台訂單查詢 API（含狀態篩選）
- EJS 前台頁面（首頁、商品詳情、購物車、結帳、訂單）
- EJS 後台頁面（商品管理、訂單管理）
- SQLite 資料庫自動初始化與種子資料
- Vitest 測試套件（6 個測試檔案，循序執行）
- Swagger/OpenAPI 文件生成
- Tailwind CSS 樣式系統
- 專案文件結構建立
