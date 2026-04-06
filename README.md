# おもりさん不動産 公式サイト

物件探しからリノベーション、売買まで。ワンストップで叶える、理想の住まいづくり。

---

## 🎯 概要

このプロジェクトは、Firebase をバックエンドとした不動産会社のWebサイトです。

### 主な機能

- **物件情報管理**: 物件の追加・編集・削除
- **お知らせ管理**: 最新情報の投稿
- **施工事例管理**: リノベーション事例の紹介
- **画像アップロード**: Firebase Storage への自動アップロード
- **認証機能**: 管理画面へのアクセス制限

---

## 🚀 セットアップ

### 1. Firebase の設定

詳しい手順は [FIREBASE_SETUP.md](FIREBASE_SETUP.md) を参照してください。

```bash
# 必要な作業
1. Firebase プロジェクトを作成
2. Authentication を有効化
3. Firestore Database を作成
4. Storage を有効化
5. firebase-config.js に設定情報を記入
```

### 2. 管理者ユーザーの作成

Firebase Console の Authentication から管理者ユーザーを作成します。

### 3. ローカルで動作確認

```bash
# Python の場合
python3 -m http.server 8000

# Node.js の場合
npx http-server

# または VS Code の Live Server 拡張機能を使用
```

ブラウザで `http://localhost:8000/login.html` にアクセスしてログイン。

---

## 🌐 公開方法

### Firebase Hosting で公開

詳しい手順は [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) を参照してください。

```bash
# Firebase CLI をインストール
npm install -g firebase-tools

# ログイン
firebase login

# デプロイ
firebase deploy --only hosting
```

### 独自ドメインの設定

1. Firebase Console でカスタムドメインを追加
2. DNS設定を追加
3. SSL証明書の発行を待つ（24時間以内）
4. `https://your-domain.com` でアクセス可能

---

## 📁 ファイル構成

```
omori-real-estate/
├── index.html              # トップページ
├── properties.html         # 物件一覧ページ
├── news.html              # お知らせページ
├── works.html             # 施工事例ページ
├── company.html           # 会社情報ページ
├── contact.html           # お問い合わせページ
├── concept.html           # サービス紹介ページ
├── login.html             # ログイン画面
├── admin-firebase.html    # 管理画面
│
├── firebase-config.js     # Firebase設定ファイル
├── firebase.json          # Firebase Hosting設定
├── .firebaserc            # Firebaseプロジェクト設定
│
├── css/
│   └── style.css          # スタイルシート
│
├── js/
│   ├── script.js              # 共通JavaScript
│   ├── admin-firebase.js      # 管理画面ロジック
│   ├── properties-firebase.js # 物件データ読み込み
│   └── news-firebase.js       # お知らせデータ読み込み
│
├── FIREBASE_SETUP.md      # Firebase設定手順
├── DEPLOY_GUIDE.md        # デプロイ手順
└── README.md              # このファイル
```

---

## 🔐 管理画面の使い方

### ログイン

1. `login.html` にアクセス
2. Firebase Authentication で作成したメールアドレスとパスワードを入力
3. ログイン成功すると管理画面に移動

### 物件の追加

1. 「物件管理」タブを選択
2. 「新規追加」ボタンをクリック
3. 物件情報を入力
4. 画像ファイルを選択（自動でFirebase Storageにアップロード）
5. 「保存」ボタンをクリック

### お知らせの投稿

1. 「お知らせ管理」タブを選択
2. 「新規追加」ボタンをクリック
3. タイトル、日付、カテゴリー、本文を入力
4. 必要に応じて画像を追加
5. 「保存」ボタンをクリック

### 施工事例の追加

1. 「施工事例管理」タブを選択
2. 「新規追加」ボタンをクリック
3. 事例情報を入力
4. メイン画像と追加画像を選択
5. 「保存」ボタンをクリック

---

## 🛠️ 技術スタック

- **フロントエンド**: HTML, CSS (Tailwind CSS), JavaScript
- **バックエンド**: Firebase
  - Authentication: ユーザー認証
  - Firestore: データベース
  - Storage: 画像保存
  - Hosting: Webサイト公開
- **デプロイ**: Firebase Hosting

---

## 📊 データ構造

### Firestore コレクション

#### properties（物件）
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

#### news（お知らせ）
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

#### works（施工事例）
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

## 💰 料金について

### Firebase 無料枠（Spark プラン）

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
      allow read: if true;  // 誰でも読み取り可能
      allow write: if request.auth != null;  // ログイン済みユーザーのみ書き込み可能
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
      allow read: if true;  // 誰でもダウンロード可能
      allow write: if request.auth != null;  // ログイン済みユーザーのみアップロード可能
    }
  }
}
```

---

## 🆘 トラブルシューティング

### ログインできない

- メールアドレスとパスワードが正しいか確認
- Firebase Console の Authentication にユーザーが登録されているか確認
- ブラウザのコンソール（F12）でエラーを確認

### データが表示されない

- `firebase-config.js` の設定が正しいか確認
- Firestore のセキュリティルールが正しく設定されているか確認
- ブラウザのコンソールでエラーを確認

### 画像がアップロードできない

- Storage のセキュリティルールが正しく設定されているか確認
- ファイルサイズが大きすぎないか確認（5MB以下推奨）
- ブラウザのコンソールでエラーを確認

---

## 📚 ドキュメント

- [Firebase Setup Guide](FIREBASE_SETUP.md) - Firebaseの初期設定
- [Deploy Guide](DEPLOY_GUIDE.md) - サイトの公開方法
- [Firebase公式ドキュメント](https://firebase.google.com/docs)

---

## 📞 サポート

質問や問題があれば、Firebase Console のサポートチャットか、公式ドキュメントを参照してください。

---

## 📄 ライセンス

このプロジェクトは おもりさん不動産株式会社 の所有物です。

---

## 🎉 完成！

管理画面から簡単にコンテンツを更新できます。

更新内容は即座に公開サイトに反映されます。
