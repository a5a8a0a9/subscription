# SubTrack Coding Style

本文件定義本專案的開發慣例。新程式碼應遵守本規範；若現有程式碼與規範不一致，修改相關區域時再逐步整理，避免無關的大範圍格式變更。

## 1. 基本原則

- 使用繁體中文（zh-TW）撰寫使用者可見文字；程式識別字、檔名及技術註解使用英文。
- 優先追求清楚、可測試與型別安全，不以縮短程式碼為主要目標。
- TypeScript 與 Angular template 必須維持 strict mode，不使用 `any` 規避型別問題。
- 一次提交聚焦單一目的；不要混入無關格式化或重構。
- 不手動修改編譯產物、`node_modules` 或 lockfile 內容；套件異動使用 npm 產生 `package-lock.json`。

## 2. 格式化

- 以專案 Prettier 設定為唯一格式標準；HTML 使用 Angular parser。
- 提交前執行 `npm run format`，並確認差異只包含預期檔案。
- 字串使用單引號；template literal 用於插值或多行內容。
- 陳述句結尾使用分號。
- 多行陣列、物件、參數與 import 保留 trailing comma。
- 不以手動對齊空白製作表格；交由 Prettier 排版。
- SCSS import 使用 `@use`，不用已棄用的 `@import`。

目前專案尚未設定 ESLint；在新增 lint 工具前，不應在文件或 CI 中宣稱 lint 已受自動驗證。

## 3. 命名規則

| 對象                     | 規則                    | 範例                                            |
| ------------------------ | ----------------------- | ----------------------------------------------- |
| 類別、介面、型別         | PascalCase              | `ActivityStore`, `BillingCycle`                 |
| 變數、函式、方法         | camelCase               | `monthlySpend`, `eventsBetween()`               |
| 常數                     | UPPER_SNAKE_CASE        | `ACTIVITY_CATEGORIES`                           |
| Component selector       | `yo-` + kebab-case      | `yo-activity-list`                              |
| Component 檔案           | kebab-case + 類型後綴   | `activity-list.component.ts`                    |
| Service/Repository/Store | kebab-case + 責任後綴   | `reminder.service.ts`, `activity.repository.ts` |
| 測試檔                   | 與來源同名 + `.spec.ts` | `activity.store.spec.ts`                        |
| SCSS partial             | `_` + kebab-case        | `_material-overrides.scss`                      |

- 名稱應表達領域意義，避免 `data`、`item2`、`handleThing` 等模糊命名。
- Boolean 使用可判斷真假的語意，例如 `isLoading`、`hasPermission`、`reminderEnabled`。
- Observable 才使用 `$` 後綴；Signal 不使用 `$` 後綴。
- 事件方法以行為命名，例如 `openForm()`、`confirmDelete()`、`enableNotifications()`。

## 4. TypeScript

- 公開領域資料使用明確的 `interface` 或 `type`；需要辨別分支的資料採 discriminated union。
- 優先使用 `unknown` 並進行 narrowing，不將外部資料直接斷言為可信型別。
- 固定選項使用字面 union 或 `as const`，避免散落 magic strings。
- 使用 `readonly` 標示不會重新指派的成員、Signal 及設定集合。
- 優先用 early return 降低巢狀層級。
- 所有 `switch` 應完整涵蓋 union；不要為掩蓋遺漏而加入無意義的 `default`。
- 日期字串統一使用 `YYYY-MM-DD`；時間戳使用 ISO 8601。日曆日期必須透過專案日期工具處理，不直接依賴 `new Date('YYYY-MM-DD')` 的 UTC 行為。
- 金額運算保持 `number`；目前產品以 TWD 整數儲存。若未來支援小數幣別，須先重新定義金額模型。

## 5. Angular

- 新元件使用 standalone component，並在 `imports` 中明列 template 所需依賴。
- 路由頁面使用 `loadComponent` lazy loading。
- Dependency Injection 優先使用 `inject()`；只有建構流程本身需要時才加入 constructor。
- 元件成員依序排列：注入依賴、公開狀態／常數、衍生狀態、constructor、公開事件方法、私有方法。
- Component 預設使用外部 HTML 與 SCSS：`templateUrl`、`styleUrl`。
- 僅將簡短且確實屬於 host 的屬性放在 `host`；不要使用 `@HostBinding`／`@HostListener` 建立分散設定。
- 新的共用元件 input/output 優先採 Angular 的 signal-based APIs；維護既有程式碼時保持局部一致性。
- Template 不執行昂貴計算；排序、篩選、格式轉換及衍生集合放在 `computed` 或純函式。
- Template 中保持語意化 HTML、可讀的 control flow，以及按鈕的明確 `type` 與 accessible label。

## 6. 狀態與 RxJS

- 同步 UI/domain state 使用 `signal`，衍生狀態使用 `computed`，對外唯讀狀態使用 `asReadonly()`。
- 集中修改共享狀態；元件不得直接改寫 Store 的內部 Signal。
- Store 負責業務狀態及衍生查詢，Repository 負責持久化，Component 負責畫面互動。
- 非同步事件串流才使用 RxJS；不要把簡單同步值包成 Observable。
- Component 內的長生命週期 subscription 使用 `takeUntilDestroyed()` 或等價的自動清理方式。
- `afterClosed()` 等自行完成的 Observable 可直接訂閱；若生命週期不明確，必須顯式清理。
- Signal effect 只用於必要副作用，不用來複製或同步可由 `computed` 推導的狀態。

## 7. 表單與輸入

- 使用 Typed Reactive Forms，`FormControl` 在適用時設定 `nonNullable: true`。
- 驗證規則放在表單模型；跨欄位規則以具名 validator 函式實作。
- 儲存前進行必要 normalization，例如 `trim()` 與金額取整；不要只依賴畫面元件限制。
- 表單無效時不得提交，且 template 必須對使用者顯示可理解的錯誤訊息。
- 使用者輸入與 `localStorage` 都視為不可信資料；載入時要驗證格式並提供安全 fallback。

## 8. 檔案與架構邊界

- `pages/`：對應路由的容器元件，組合狀態及 UI。
- `components/`：功能內可重用、聚焦呈現或單一互動的元件。
- `data-access/`：Store、Repository、API 或瀏覽器整合服務。
- `models/`：領域模型、union、常數及 label maps；不得依賴 UI framework。
- `utils/`：無副作用的純函式；不得注入服務或直接讀寫 browser storage。
- `layout/`：跨功能的應用程式框架元件。
- 跨資料夾引用若已有 path alias（例如 `@layout/*`）則使用 alias；同一 feature 內使用相對路徑。
- 避免 barrel file 造成循環依賴；除非對外 API 明確且穩定，否則直接 import 來源檔案。

## 9. 樣式

- 共用 design tokens 放在 `styles/abstracts`，全域 reset/theme/vendor 設定放在 `src/styles` 對應層級。
- 元件專屬樣式留在元件 SCSS，避免不必要的全域 selector。
- Angular Material 元件優先使用官方 API 與 theme；只有 API 無法處理時才新增集中式 override。
- Bootstrap 主要用於 layout utility；同一元素避免同時混用互相衝突的 Bootstrap 與 Material 視覺規則。
- 優先使用既有 CSS variables／tokens，不重複硬編碼顏色、間距與陰影。
- 新增版面需涵蓋窄螢幕並支援鍵盤 focus 狀態；不要只以 hover 傳達操作。
- Production 的單一元件樣式必須維持在 Angular budget：4 kB 警告、8 kB 失敗。

## 10. 錯誤處理與瀏覽器 API

- 對 `localStorage`、JSON parsing、Notification、Crypto 等 browser APIs 做能力檢查或例外處理。
- 可恢復錯誤提供安全 fallback；不可恢復或會造成資料遺失的錯誤不得靜默忽略。
- 向使用者顯示簡潔、可行動的錯誤訊息；技術細節留給開發紀錄。
- 新增全域事件 listener 時，必須在服務或元件銷毀時移除。
- 不把機密、token 或個資寫入 `localStorage`。若未來加入認證，需另立安全規格。

## 11. 測試

- 測試名稱描述行為與結果，避免只重述方法名稱。
- 工具函式採純單元測試，涵蓋正常值、邊界值及無效範圍。
- Store／Repository 測試需隔離及清理 `localStorage`，不可依賴測試執行順序。
- 日期測試必須固定輸入，不依賴執行當天或時區才能通過。
- 計費週期至少涵蓋月、季、年、自訂日／月／年及月底截斷。
- 修正 bug 時先新增可重現問題的測試，再修改實作。
- 送交變更前執行：

```bash
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

## 12. 註解與文件

- 優先讓名稱與結構說明意圖；註解著重「為什麼」，不要逐行翻譯程式碼。
- 對不直觀的日期、週期、相容性或資料遷移決策補充短註解。
- 修改產品行為、資料模型、storage version、路由或開發流程時，同步更新 `PROJECT_SPEC.md` 或 `README.md`。
- 公開工具函式只有在型別與名稱不足以表達限制時才加入 JSDoc。
