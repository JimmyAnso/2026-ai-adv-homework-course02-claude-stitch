# E2E 綠界結帳測試 skill

## 目標
把「登入 → 加入購物車 → 結帳 → 綠界網路ATM（臺灣土地銀行）→ 付款完成」的手動 E2E 流程寫成專案 skill，之後以 `/e2e-ecpay-checkout` 重跑，並在結束時附上截圖。

## 決定
- 執行方式：Claude 透過 Playwright MCP 逐步操作（不在專案內放測試腳本、不改 package.json）
- 截圖：存到 `e2e-artifacts/<時間>/`（不進版本控制），並在對話中逐張列出
- 伺服器：只關閉 skill 自己啟動的 3001，且僅在測試成功時關閉
- 安全：只在 `ECPAY_ENV=staging` 時執行；帳密從 `.env` 讀取，不顯示於回覆

## 範圍
- 新增 `.claude/skills/e2e-ecpay-checkout/SKILL.md`
- `.mcp.json`：playwright 加上 `--isolated`、`--output-dir e2e-artifacts`、`--viewport-size 1280x900`
- `.gitignore`：忽略 `e2e-artifacts/`
- `docs/TESTING.md`：新增 E2E 小節；`docs/CHANGELOG.md`：新增紀錄

## 已知狀況
綠界測試環境偶爾停在「交易資料傳輸中」（`Common/DoAutoSubmitForm`），skill 會等待最多 90 秒並自動重試最多 2 次。
