# SubTrack

以 Angular 22、Angular Material 與 Bootstrap 5 建立的個人訂閱管理 PWA。資料儲存在瀏覽器本機，不需要帳號或後端服務。

## 開發環境

- Node.js 22.22.3
- npm

```bash
npm install
npm start
```

開啟 `http://localhost:4200/` 即可使用。

## 驗證

```bash
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

Production build 會輸出至 `dist/activity-manager/browser/`。

## 功能

- 儀表板與未來 30 天支出總覽
- 訂閱新增、編輯、刪除、搜尋與篩選
- 月、季、年及自訂計費週期
- 預計扣款月曆
- 站內提醒與瀏覽器通知
- PWA 離線啟動
