# 大森不動産 公式サイト

物件探しからリノベーション、売買まで。ワンストップで叶える、理想の住まいづくり。

---

## 🎯 概要

このプロジェクトは、Eleventy（静的サイトジェネレータ）+ Tailwind CSS + Firebase で構築された不動産会社のWebサイトです。

### 主な機能

- **物件情報管理**: 物件の追加・編集・削除
- **お知らせ管理**: 最新情報の投稿
- **施工事例管理**: リノベーション事例の紹介
- **画像アップロード**: Firebase Storage への自動アップロード
- **認証機能**: 管理画面へのアクセス制限

---

## 🛠️ 技術スタック

- **テンプレートエンジン**: [Eleventy (11ty)](https://www.11ty.dev/) + Nunjucks
- **CSSフレームワーク**: [Tailwind CSS v4](https://tailwindcss.com/)（PostCSS経由でビルド）
- **バックエンド**: Firebase
  - Authentication: ユーザー認証
  - Firestore: データベース
  - Storage: 画像保存
  - Hosting: Webサイト公開
- **ビルドツール**: PostCSS CLI + npm-run-all

---

## 📁 ファイル構成

ソースは **`src/`** と **`js/`**（静的コピー）のみを編集します。HTML の生成物は **`npm run build` で `_site/` に出力**され、Firebase Hosting もこの `_site` を公開します（`_site/` は `.gitignore` 対象のためリポジトリには含めません）。

```
omori/
├── src/
│   ├── _includes/layouts/
│   │   ├── base.njk            # 公開ページ共通（head / header / footer）
│   │   └── admin.njk           # 管理・ログイン用レイアウト
│   ├── css/main.css            # Tailwind v4 + カスタムCSS（ビルド元）
│   ├── index.njk … 各ページ（.njk）
│   └── 404.njk
├── js/                         # Eleventy が _site/js にコピー
│   ├── script.js
│   ├── header.js
│   ├── admin-firebase.js
│   ├── properties-firebase.js
│   ├── news-firebase.js
│   └── works-firebase.js
├── images/
├── firebase-config.js          # Firebase 設定（チーム運用なら共有可）
├── firebase.json               # Hosting: public は _site
├── .eleventy.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .github/workflows/deploy.yml  # main へ push でビルド＆デプロイ（WIF）
├── FIREBASE_SETUP.md
├── DEPLOY_GUIDE.md
└── README.md
```

ビルド後の `_site/` には上記に加え、`css/main.css`・コピー済み `js/`・`images/`・各 `.html` が並びます。

---

## 🚀 開発手順

### 1. パッケージのインストール

```bash
npm install
```

### 2. Firebase の設定

詳しい手順は [FIREBASE_SETUP.md](FIREBASE_SETUP.md) を参照してください。

`firebase-config.js` に Firebase プロジェクトの設定情報を記入します。

### 3. 開発サーバーの起動

```bash
npm run dev
```

- `http://localhost:8080` でプレビューが開きます
- ファイルを保存すると自動リロードされます
- CSS・HTML 両方をウォッチします

### 4. 本番ビルド

```bash
npm run build
```

`_site/` ディレクトリに本番用ファイルが生成されます。

---

## 🌐 デプロイ方法

### Firebase Hosting で公開

```bash
# Firebase CLI をインストール（未インストールの場合）
npm install -g firebase-tools

# ログイン
firebase login

# ビルド後にデプロイ
npm run build
firebase deploy --only hosting
```

詳しい手順は [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) を参照してください。

### GitHub Actions（自動デプロイ）

`main` ブランチへ push すると、`.github/workflows/deploy.yml` が `npm run build` 実行後に Firebase Hosting へデプロイします（Google Cloud の Workload Identity Federation で認証。リポジトリの Secrets は不要な構成の場合があります）。

---

## 🔐 管理画面の使い方

1. `/login.html` にアクセス
2. Firebase Authentication のメールアドレスとパスワードでログイン
3. ログイン成功後 `/admin-firebase.html`（`/admin` からリダイレクト）へ移動

### 物件・お知らせ・施工事例の管理

管理画面のタブから各データを追加・編集・削除できます。

---

## 📊 データ構造（Firestore）

### properties（物件）

```javascript
{
  title: "世田谷区 築浅マンション",
  area: "東京都世田谷区",
  price: 3980,
  layout: "2LDK",
  areaSize: 65.5,
  age: 8,
  label: "NEW",
  image: "https://...",
  description: "...",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### news（お知らせ）

```javascript
{
  title: "ホームページをリニューアルしました",
  date: "2026-02-01",
  category: "お知らせ",
  content: "...",
  image: "https://...",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### works（施工事例）

```javascript
{
  title: "ナチュラルモダンなマンションリノベ",
  area: "東京都目黒区",
  layout: "2LDK",
  cost: 580,
  description: "...",
  image: "https://...",
  images: ["https://...", "https://..."],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 💰 Firebase 無料枠（Spark プラン）

- **Firestore**: 1GB まで無料
- **Storage**: 5GB まで無料
- **Hosting**: 10GB/月 まで無料

小規模サイトであれば**完全無料**で運用できます。

---

## 🔒 セキュリティ

### Firestore セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage セキュリティルール

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🆘 トラブルシューティング

### ビルドが失敗する

```bash
# node_modules を再インストール
rm -rf node_modules
npm install
npm run build
```

### ログインできない

- `firebase-config.js` の設定が正しいか確認
- Firebase Console の Authentication にユーザーが登録されているか確認
- ブラウザのコンソール（F12）でエラーを確認

### データが表示されない

- `firebase-config.js` の設定が正しいか確認
- Firestore のセキュリティルールを確認
- ブラウザのコンソールでエラーを確認

---

## 📚 ドキュメント

- [Firebase Setup Guide](FIREBASE_SETUP.md) - Firebaseの初期設定
- [Deploy Guide](DEPLOY_GUIDE.md) - サイトの公開方法
- [Eleventy 公式ドキュメント](https://www.11ty.dev/docs/)
- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs)
- [Firebase 公式ドキュメント](https://firebase.google.com/docs)

---

## 📄 ライセンス

このプロジェクトは 大森不動産株式会社 の所有物です。
