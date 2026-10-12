# 企業會員管理系統

以 Vue 3、TypeScript 與 Vite 建置的會員管理前端。開發時使用 JSON Server 作為本機 API。

## 功能

- 查看會員清單及會員總數
- 依姓名和會員狀態搜尋
- 新增、編輯及刪除會員
- 以分頁瀏覽會員資料

## 技術

- Vue 3、TypeScript、Vue Router
- Vite
- Axios
- JSON Server（本機開發 API）

## 環境需求

- Node.js 24（GitHub Actions 使用的版本）
- npm

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

GitHub Actions 會在推送至 `main` 分支時執行建置，並將 `dist` 部署到 GitHub Pages。

專案頁面：https://hughestt.github.io/enterprise-member-system/

## API 注意事項

前端 API 位址目前設定為 `http://localhost:3000`。本機開發時，請同時啟動 JSON Server；GitHub Pages 僅託管靜態前端，不會託管 API。其他使用者開啟公開網站時，`localhost` 會指向他們自己的裝置，因此會員資料的讀取與新增、編輯、刪除功能無法連到你的本機 API。若要公開使用完整功能，需另行部署 API，並將前端 API 位址改為該服務的公開網址。
