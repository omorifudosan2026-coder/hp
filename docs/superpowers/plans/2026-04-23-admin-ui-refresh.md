# 管理系UI刷新（ログイン/管理画面） Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 管理系（`/login.html` と `/admin-firebase.html`）の見た目を公開側TOPのトーンに揃え、角丸を排し、ボタンを `site-btn` 系へ統一する。

**Architecture:** 既存の公開側ユーティリティ（`site-btn`, `section-label`, `bg-cream`, `bg-dots` 等）を再利用し、管理系テンプレートのTailwindクラス置換を中心に対応する。必要最小限だけ `main.css` に管理系補助スタイル（タブ等）を追加する。

**Tech Stack:** Eleventy（Nunjucks `.njk`）、Tailwind（ユーティリティクラス）、共通CSS（`src/css/main.css`）、Firebase（認証/管理JSは対象外）

---

## File structure / 変更対象

**Modify:**
- `src/login.njk`（`/login.html`）
- `src/admin-firebase.njk`（`/admin-firebase.html`）
- `src/css/main.css`（管理タブ等の補助スタイルが必要な場合のみ）

**No change (out of scope):**
- `src/_includes/layouts/admin.njk`（レイアウト自体は基本維持。必要になったら別タスクで最小変更）
- `src/js/admin-firebase.js` 等の挙動系

---

### Task 1: `/login.html` を公開側トーンへ刷新

**Files:**
- Modify: `src/login.njk`

- [ ] **Step 1: 既存のUI構成を確認し、置換対象クラスをメモ**
  - `bodyClass`（グレーグラデ → クリーム基調）
  - 角丸/強い影（`rounded-*`, `shadow-*`）
  - ボタン（`bg-primary ...` → `site-btn`）
  - inputの `focus:ring-*` を外して `main.css` のフォーム共通に寄せる

- [ ] **Step 2: `bodyClass` を公開側に寄せる**
  - 例: `bg-cream min-h-screen flex items-center justify-center px-6 py-10`

- [ ] **Step 3: ヘッダー部分を `section-label` + 見出し構成へ**
  - 余計な“カード箱”を撤去（角丸/強い影なし）
  - `text-ink` と `text-primary` を使い分け

- [ ] **Step 4: フォームUIを整え、ボタンを `site-btn` に統一**
  - ログインボタン:

```html
<button type="submit" id="login-btn" class="site-btn site-btn--lg site-btn--primary w-full">
  <span class="site-btn__inner">ログイン</span>
</button>
```

  - エラー表示は薄いボーダー+背景に（赤ベタ/角丸は避ける）

- [ ] **Step 5: ビルド/表示確認**
  - Run: `npm test` などが無ければ `npm run build` / `npm run dev` 相当（リポジトリの既定コマンドに合わせる）
  - Expected: `/login.html` が `bg-cream`、角丸なし、ボタンが公開側と同じ挙動（ホバーで塗りが伸びる）

---

### Task 2: `/admin-firebase.html` を公開側トーンへ刷新

**Files:**
- Modify: `src/admin-firebase.njk`

- [ ] **Step 1: ヘッダーを `bg-cream` + ヘアライン構成へ**
  - `bg-white shadow-sm border-b` → `bg-cream border-b border-[var(--color-border)]` 相当
  - 右側アクションを `site-btn` に統一（公開サイトへ、ログアウト）

- [ ] **Step 2: タブの見た目を“公開側リンクの強弱”へ**
  - アクティブ: `text-primary border-primary`
  - 非アクティブ: `text-muted` + hoverで `text-primary`
  - 角丸は付けない

- [ ] **Step 3: 一覧パネル/カード類の角丸を排除し、罫線主体へ**
  - `rounded-lg` / `rounded-xl` を撤去
  - `shadow-lg` を必要最小限へ（できれば薄い `shadow-[...]`）
  - “セクション箱感”は border で作る

- [ ] **Step 4: 主要ボタン（新規追加/保存/キャンセル等）を `site-btn` に統一**
  - 新規追加:

```html
<button class="site-btn site-btn--md site-btn--primary">
  <span class="site-btn__inner">＋ 新規追加</span>
</button>
```

  - キャンセル: `site-btn--outline-muted` など

- [ ] **Step 5: モーダルの角丸撤去**
  - `rounded-xl` を撤去
  - 既存の `[data-admin-modal-panel]` アニメは維持

- [ ] **Step 6: 表示確認**
  - Expected: 全体 `bg-cream`、パネルは角丸なし、ボタンは公開側と同じ `site-btn` のホバー挙動

---

### Task 3: （必要なら）`main.css` に管理タブ等の補助スタイル追加

**Files:**
- Modify: `src/css/main.css`（必要な場合のみ）

- [ ] **Step 1: `admin-firebase.njk` だけで表現しきれない箇所を特定**
  - 例: `.tab-btn` の下線/ホバー/アクティブ表現を統一したい

- [ ] **Step 2: 管理系専用の小さなルールを追加**
  - 既存の `--color-*`（primary/cream/ink/border）を使用
  - 角丸を追加しない

- [ ] **Step 3: 既存公開側の見た目を壊していないことを確認**
  - Expected: TOP等は変化なし、管理系だけ改善

---

## Plan self-review（spec coverage）

- 角丸不要: Task 1/2/3 で `rounded-*` 排除
- ボタンを公開側に統一: Task 1/2 で `site-btn` に置換
- ヘッダーはクリーム基調: Task 2 Step 1
- 追加CSSは最小: Task 3 を “必要なら” として分離

