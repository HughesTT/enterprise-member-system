# 企業會員管理系統

使用 Vue 3、TypeScript 與 Vite 建置的企業會員管理後台練習專案，實作登入驗證、角色權限管理及會員 CRUD 功能。

本機開發使用 JSON Server 模擬 API，並透過 Vitest 與 Vue Test Utils 建立自動化測試。

## 功能

- 管理員與客服人員登入
- 依使用者角色控管會員管理操作權限
- 查看會員清單及會員總數
- 依姓名和會員狀態搜尋
- 新增、編輯及刪除會員
- 以分頁瀏覽會員資料
- 表單驗證及 API 錯誤處理

## 技術

- Vue 3、TypeScript、Vue Router
- Pinia：登入狀態與使用者資訊管理
- Axios：HTTP API 請求
- Vite：開發與正式版建置
- JSON Server：本機模擬 API
- Vitest、Vue Test Utils：自動化測試

## 專案架構

```text
src/
├── api/          # API 請求
├── components/   # Vue 元件
├── composables/  # 共用邏輯
├── router/       # 路由與權限控管
├── stores/       # Pinia 狀態管理
├── types/        # TypeScript 型別
├── utils/        # 共用工具
├── views/        # 頁面
├── App.vue
├── main.ts
└── style.css     # 全域樣式
```

## 環境需求

- Node.js 24
- npm

GitHub Actions 使用 Node.js 24 進行自動化建置。


## 本機開發

安裝相依套件：

```sh
npm ci
```

在第一個終端機啟動本機 API（預設為 `http://localhost:3000`）：

```sh
npm run server
```

在第二個終端機啟動前端開發伺服器：

```sh
npm run dev
```

依終端機顯示的網址開啟前端，通常是 `http://localhost:5173`。會員資料儲存在專案根目錄的 `db.json`。


## 自動化測試

使用 Vitest 與 Vue Test Utils 建立自動化測試，涵蓋登入狀態、會員資料操作、表單驗證、權限控制及 API 錯誤處理。

執行測試：
```sh
npm run test
```


## 建置與預覽

執行 TypeScript 檢查並建立正式版檔案：

```sh
npm run build
```

預覽正式版建置結果：

```sh
npm run preview
```


## 部署
### 前端網站

使用 GitHub Pages 部署前端：

https://hughestt.github.io/enterprise-member-system/

GitHub Actions 會在推送至 main 分支時自動執行建置，並將 dist 部署至 GitHub Pages。

## 公開 API

使用 Render Web Service 部署 JSON Server：
https://enterprise-member-system-api.onrender.com/members
前端透過 Vite 環境變數 VITE_API_BASE_URL 設定 API Base URL：
- 本機開發：預設使用 http://localhost:3000
- 公開展示：使用 Render 公開 API 網址

GitHub Actions 在正式建置時注入公開 API 網址，讓 GitHub Pages 上的前端可以連接 Render API。

## 部署架構與 API 注意事項

本專案採用前後端分開部署：
- 前端：GitHub Pages，負責 Vue 3 網站及使用者介面。
- API：Render Web Service，使用 JSON Server 提供 RESTful API。
- 資料：使用 db.json 儲存會員測試資料。

### 公開展示環境限制
- Render 免費服務在一段時間沒有請求後可能進入休眠，首次請求可能需要等待服務重新啟動。
- Render 免費服務使用暫存檔案系統，重新啟動或重新部署後，會員資料可能恢復成 GitHub 儲存庫內 db.json 的初始內容。
- 公開 API 未實作正式的後端身分驗證及權限控管，任何知道 API 網址的人都可能直接呼叫資料操作端點。
- 專案的登入與角色權限主要用於前端功能展示，並非正式的安全驗證機制。

## 測試帳號

| 角色 | 帳號 | 密碼 | 權限 |
|---|---|---|---|
| 管理員 | admin | admin123 | 會員新增、編輯及刪除 |
| 客服人員 | staff | staff123 | 查看會員及使用搜尋功能 |

> 本專案使用固定帳號密碼模擬登入驗證，測試帳號僅供功能展示與測試，並非正式身分驗證機制。
