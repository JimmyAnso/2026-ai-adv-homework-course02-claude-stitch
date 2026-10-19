---
name: e2e-ecpay-checkout
description: 用 Playwright MCP 跑花漾生活的結帳 E2E 測試：登入、加入購物車、結帳、在綠界測試環境選「網路ATM ＋ 臺灣土地銀行」完成付款，並驗證訂單變成已付款，結束時附上每一步的截圖。使用者要求「跑 E2E」、「測結帳流程」、「測綠界付款」或執行 /e2e-ecpay-checkout 時使用。
---

# 綠界結帳 E2E 測試

用 Playwright MCP（`mcp__playwright__browser_*` 工具）逐步操作瀏覽器，走完一筆訂單從加入購物車到綠界付款成功的完整流程。每一步都要先確認畫面符合檢查點，再存截圖，最後把截圖逐張附在回報裡。

全程只在**綠界測試環境（staging）**操作，不會真的扣款。

## 前置檢查

依序確認，任何一項不符合就停下來告訴使用者原因，不要硬跑。

1. **Playwright MCP 可用**：確認有 `mcp__playwright__browser_navigate` 等工具（必要時用 ToolSearch 搜尋 `playwright`）。找不到時請使用者重新啟動 Claude Code，並在 `/mcp` 核准專案的 playwright 伺服器（設定在 `.mcp.json`）。
2. **`.env` 設定**：用 Bash 確認 `.env` 存在，且有 `JWT_SECRET`、`ADMIN_EMAIL`、`ADMIN_PASSWORD` 三個鍵，並且 `ECPAY_ENV=staging`。
   - `ECPAY_ENV` 不是 `staging` 就**停止**，避免在正式金流付款。
   - 只用 `grep` 讀出 `ADMIN_EMAIL` 與 `ADMIN_PASSWORD` 的值供登入使用；**回覆中不得出現密碼**，也不要把整個 `.env` 印出來。
3. **伺服器**：執行 `lsof -ti tcp:3001 -sTCP:LISTEN`。
   - 有結果：使用者自己開著，記下「伺服器非本次啟動」，測完**不要關**。
   - 沒結果：用 Bash 背景執行 `npm run start`，再用 `until curl -s -o /dev/null http://localhost:3001/; do sleep 1; done` 等待就緒，記下「伺服器由本次啟動」。
4. **截圖資料夾**：用 `date +%Y%m%d-%H%M%S` 產生本次時間戳 `<RUN>`，截圖一律存到 `e2e-artifacts/<RUN>/`。

## 測試步驟

每一步的做法：操作 → `browser_snapshot`（或 `browser_wait_for`）確認檢查點 → 用 `browser_take_screenshot` 存檔，參數 `filename: "e2e-artifacts/<RUN>/<檔名>.png"`、`fullPage: true`。

過程中記下這些值，最後驗證要用：**品名、金額、綠界訂單編號（ORD 開頭、無連字號）、本站訂單 id**。

| # | 操作 | 檢查點（全部符合才算通過） | 截圖 |
|---|---|---|---|
| 1 | `browser_navigate` 到 `http://localhost:3001/` | 頁面標題含「花漾生活」 | `01-home` |
| 2 | 前往 `/login`，在 Email（`#login-email`）、密碼（`#login-password`）欄位輸入 `.env` 的帳密，按「登入」 | 導回首頁；頁首右上顯示使用者名稱與「登出」 | `02-logged-in` |
| 3 | 用 `browser_evaluate` 清空購物車（見下方程式片段），重新整理首頁；在「本季精選」第一張商品卡按「加入購物車」 | 出現「已加入購物車」提示；用 `browser_evaluate` 取 `/api/cart`，`items` 只有 1 筆。記下品名與 `total` | `03-cart`（前往 `/cart` 後截圖） |
| 4 | 在 `/cart` 按「前往結帳」；填「收件人姓名」`測試收件人`、「Email」`.env` 的 ADMIN_EMAIL、「收件地址」`台北市大安區復興南路一段 100 號 5 樓`；先截圖，再按「送出訂單並付款」 | 網址變成 `https://payment-stage.ecpay.com.tw/...`；頁面顯示的「實際付款金額」等於步驟 3 的 `total`；記下綠界訂單編號 | `04-checkout`（送出前）、`05-ecpay` |
| 5a | 在「付款方式」點「網路ATM」 | 出現「選擇銀行」下拉選單 | — |
| 5b | 用 `browser_select_option` 在「選擇銀行」選「台灣土地銀行」；先截圖，再點網路ATM 的「前往付款」；跳出提醒視窗後按「關閉」 | 網址到達 `https://pay-stage.ecpay.com.tw/MockMPPost/LandWebAtm`（最多等 90 秒，見「已知狀況」） | `06-webatm-landbank`（點前往付款前） |
| 6 | 在土地銀行模擬頁確認欄位後按「Save」 | 送出前：`RC` 為 `0`、`MSG` 為「交易成功」、`CurAmt` 等於金額。送出後：網址含 `/webatm/result`，畫面顯示「付款成功」 | `07-landbank-mock`（Save 前）、`08-ecpay-success` |
| 7 | 在付款成功頁按「返回商店」 | 導回 `http://localhost:3001/orders/<id>?payment=pending`；頁面會自動向綠界查詢，等到標題出現「付款完成」。再用 `browser_evaluate` 驗證（見下方程式片段）：`status` 為 `paid`、`order_no` 去掉 `-` 後等於綠界訂單編號、品項與步驟 3 相同、購物車為空 | `09-order-paid` |
| 8 | 讀訂單詳情橫幅上的建立時間 | 等於 `created_at`（資料庫存 UTC）加 8 小時的台北時間 | （同 `09`） |

### 綠界頁面的操作要點

- 綠界付款頁同時藏著好幾個「前往付款」按鈕（行動支付、iPASS、街口…），**一定要點網路ATM 那顆**，它的 id 是 `#WebATMPaySubmit`。用 snapshot 找 ref 時，請選緊接在「選擇銀行」下拉與注意事項之後、目前可見的那一顆。
- 點「前往付款」後會跳出「綠界科技貼心提醒您，將跳轉至銀行頁面…」的視窗，按「關閉」才會開始跳轉。
- 土地銀行模擬頁是綠界測試環境提供的假銀行頁，欄位已預先填好「交易成功」，**不要修改任何欄位**，直接按「Save」。

### 程式片段（`browser_evaluate` 用）

清空購物車（步驟 3）：

```js
async () => {
  const res = await apiFetch('/api/cart');
  for (const item of res.data.items) await apiFetch('/api/cart/' + item.id, { method: 'DELETE' });
  return (await apiFetch('/api/cart')).data.items.length;
}
```

讀取購物車（步驟 3、7）：

```js
async () => (await apiFetch('/api/cart')).data
```

驗證訂單（步驟 7、8）：

```js
async () => {
  const id = document.getElementById('app').dataset.orderId;
  const order = (await apiFetch('/api/orders/' + id)).data;
  const taipei = new Date(order.created_at.replace(' ', 'T') + 'Z')
    .toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', dateStyle: 'medium', timeStyle: 'short' });
  const cart = (await apiFetch('/api/cart')).data.items.length;
  return { id, order_no: order.order_no, status: order.status, total: order.total_amount,
           items: order.items.map(i => i.product_name + ' x' + i.quantity),
           created_at: order.created_at, expectedTime: taipei, cartItems: cart };
}
```

## 已知狀況與處理

- **綠界測試環境卡在「交易資料傳輸中」**：步驟 5b 之後偶爾會停在 `pay-stage.ecpay.com.tw/Common/DoAutoSubmitForm`，畫面寫「交易資料傳輸中…請勿關閉視窗」。這是綠界 staging 的問題，不是本站的問題。
  - 先用 `browser_wait_for` 分段等待，總共最多 90 秒。
  - 仍未到達土地銀行模擬頁：存 `error-<步驟>-<第幾次>` 截圖，**從步驟 3 重新開始**（會建立新訂單）。最多重試 2 次。
  - 重試留下的訂單會停在「待付款」，在回報中列出這些訂單編號。
- **任何頁面要求輸入真實卡號、銀行帳號或密碼**（不是上面描述的模擬頁）：立刻停止並回報，不要輸入。
- 其他檢查點不符合：存 `error-<步驟>` 截圖，記下當下網址與畫面文字，停止測試並回報，不要自行修改程式碼。

## 收尾

1. 呼叫 `browser_close` 關閉瀏覽器。
2. 伺服器：
   - 「由本次啟動」且**測試成功** → 用 `lsof -ti tcp:3001 -sTCP:LISTEN | xargs kill` 關閉，並確認 3001 已無監聽。
   - 「由本次啟動」但**測試失敗** → 保留，方便排查，並告訴使用者伺服器仍在執行。
   - 「非本次啟動」→ 不動。
3. 用 Read 逐張打開 `e2e-artifacts/<RUN>/` 內的截圖，確認畫面與檢查點相符。

## 回報格式

1. 一句話結論：通過或失敗、訂單編號、最終狀態。
2. 步驟結果表：

   | 步驟 | 結果 | 說明 |
   |---|---|---|
   | 1. 開啟網站 | ✔ | … |

3. 截圖清單（每張都要列出）：

   | 截圖 | 路徑 | 證明了什麼 |
   |---|---|---|
   | 01-home | `e2e-artifacts/<RUN>/01-home.png` | 網站可正常開啟 |

4. 重試或失敗時：列出卡住的網址、`error-*` 截圖、留下的待付款訂單編號。
5. 伺服器最後狀態（已關閉／保留中／未變動）。
