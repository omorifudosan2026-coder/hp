---
title: 管理系UI刷新（ログイン/管理画面）デザイン
date: 2026-04-23
scope:
  - /login.html
  - /admin-firebase.html
non_goals:
  - 管理機能の追加・挙動変更（認証/CRUD/Firestore構造など）
  - 公開側（TOP等）のデザイン変更
decisions:
  - 角丸は原則使わない（rounded-* を撤去）
  - ボタンは公開側と同じ site-btn 系へ統一
  - 管理画面ヘッダーはクリーム基調（bg-cream）＋ヘアラインで区切る
---

## 背景 / 目的

公開側（TOPを中心とした）トーン & マナー（配色、余白、罫線、タイポ、`site-btn`）に、管理系ページ（ログイン/管理画面）も揃える。現状の管理系は灰色基調・角丸カード中心で、公開側と世界観が分離しているため、ブランド一貫性を上げる。

## 対象ページ

- `src/login.njk` → `/login.html`
- `src/admin-firebase.njk` → `/admin-firebase.html`
- 共通レイアウト: `src/_includes/layouts/admin.njk`

## デザイン原則（管理系の見た目ルール）

- **背景**: クリーム（`bg-cream` / `--color-cream`）を基調。必要に応じて `bg-dots` を薄く利用。
- **区切り**: 影よりも「ヘアライン（`--color-border`）」で区切る。影は控えめ。
- **角丸**: 原則なし（`rounded-*` を撤去）。モーダル等も角丸を付けない。
- **文字**: 公開側同様 `Zen Kaku Gothic New` 前提。見出しのトラッキング/行間は `main.css` の共通ルールに寄せる。
- **ボタン**: `site-btn`（`site-btn--primary` / `site-btn--outline-ink` / `site-btn--outline-muted`）に統一。`site-btn__inner` を必ず使う。
- **フォーム**: `main.css` のフォーム共通（border/focus）を活かし、Tailwindの `focus:ring-*` 系は極力外す（見え方の二重化防止）。

## `/login.html`（ログイン）画面設計

### レイアウト

- 中央寄せの単一カラム（`max-w-md` 程度）で維持。
- 背景は `bg-cream`。ページ全体の `bodyClass` を公開側トーンへ変更する。

### ヘッダー（ロゴ/タイトル）

- 余計なカード箱（角丸・強い影）は撤去。
- `section-label` を用意し、上部に短い英字ラベル（例: `Admin Login`）を置く。
- 見出しは公開側に合わせて `text-ink` を基調、アクセントに `text-primary`。

### フォーム

- ラベル/入力の間隔は公開側のリズム（詰めすぎない）。
- エラー表示は強い赤ベタを避け、薄い赤背景＋ボーダー＋本文は小さめで整える。
- 送信ボタンは `site-btn site-btn--lg site-btn--primary` に変更。
- 「公開サイトに戻る」リンクは `section-viewall-link` 相当のリンク表現（下線/ホバーで強く）に寄せる。

## `/admin-firebase.html`（管理画面）画面設計

### ヘッダー

- 背景: `bg-cream`
- 仕切り: 下にヘアライン（border）
- 右側アクション（公開サイトへ/ログアウト）は `site-btn` に統一
  - 公開サイトへ: `site-btn--outline-ink`（リンク風でも良いが統一優先）
  - ログアウト: `site-btn--dark` か `site-btn--outline-muted`（視認性を見て決める）

### タブ（お知らせ/施工事例）

- 角丸は付けない。
- アクティブ: オレンジ文字 + 下線（border-bottom）
- 非アクティブ: ink/muted、ホバーでオレンジ
- `tab-btn` の見た目を `main.css` のトーンに寄せる（必要なら管理系専用の軽いCSSを追加）。

### コンテンツパネル（一覧カード）

- 白地 + ヘアライン + 控えめ影で統一、角丸は付けない。
- セクション見出し（例: お知らせ一覧）は `text-ink` と余白で整理（巨大な角丸カード感は排除）。
- 「新規追加」などの主要CTAは `site-btn--primary` に統一。

### モーダル（追加/編集）

- 既存のオーバーレイ（暗幕 + blur）は維持。
- パネルは角丸を外し、余白・区切り・フォームの整えで“公開側の清潔さ”に寄せる。
- フォーム内ボタン（キャンセル/保存）も `site-btn` に統一。

## アクセシビリティ / 互換性

- `:focus-visible` のアウトラインは `main.css` の `site-btn` 既定に寄せる。
- カラーコントラストは `text-ink` 基調で確保。
- `prefers-reduced-motion` は既存の `site-btn` / モーダルアニメの配慮を維持。

## 実装方針（影響範囲）

- 変更は管理系テンプレート（`login.njk`, `admin-firebase.njk`）中心。
- 可能な限り既存の公開側ユーティリティ（`site-btn`, `section-label`, `bg-cream`, `bg-dots` 等）を再利用し、管理専用CSSの追加は最小限にする。

