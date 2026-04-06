# 🚀 Firebase Hosting デプロイガイド

おもりさん不動産のWebサイトを独自ドメインで公開する手順です。

---

## 📋 前提条件

- Firebase プロジェクトが作成済み
- `firebase-config.js` に設定情報を入力済み
- Node.js がインストールされている

---

## ⚡ クイックスタート

### 1. Firebase CLI をインストール

```bash
npm install -g firebase-tools
```

### 2. Firebaseにログイン

```bash
firebase login
```

ブラウザが開くので、Googleアカウントでログインします。

### 3. プロジェクトを初期化（初回のみ）

```bash
cd /Users/r_mizuguchi/Desktop/omori-real-estate
firebase init hosting
```

質問に答える：
- **プロジェクト**: 作成したFirebaseプロジェクトを選択
- **公開ディレクトリ**: `.` (ドットを入力)
- **SPA設定**: `No`
- **上書き**: `No`

### 4. プロジェクトIDを設定

`.firebaserc` を開いて、`your-project-id` を実際のプロジェクトIDに変更：

```json
{
  "projects": {
    "default": "omori-real-estate"  ← ここを変更
  }
}
```

### 5. デプロイ！

```bash
firebase deploy --only hosting
```

完了すると、以下のようなURLが表示されます：
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project.web.app
```

---

## 🌐 独自ドメインの設定

### ステップ1: Firebase Console で設定

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクトを選択
3. 左メニューから「Hosting」をクリック
4. 「カスタムドメインを追加」をクリック
5. 独自ドメインを入力（例: `omorisan-fudosan.com`）
6. 「続行」をクリック

### ステップ2: DNS設定

Firebase が表示するDNS設定情報を、ドメイン管理サービスで設定します。

#### パターン1: Aレコード（推奨）

```
タイプ: A
名前: @
値: 151.101.1.195
```

```
タイプ: A
名前: @
値: 151.101.65.195
```

#### パターン2: CNAME（wwwサブドメイン）

```
タイプ: CNAME
名前: www
値: your-project.web.app
```

### ステップ3: DNS設定の例

**お名前.com の場合:**
1. ドメインNaviにログイン
2. 「DNS設定」→「DNS追加」
3. 上記のレコードを追加

**ムームードメイン の場合:**
1. コントロールパネルにログイン
2. 「ムームーDNS」→「変更」
3. カスタム設定で上記のレコードを追加

**エックスドメイン の場合:**
1. ドメインパネルにログイン
2. 「DNS設定」
3. 上記のレコードを追加

### ステップ4: SSL証明書の発行待ち

DNS設定後、Firebaseが自動でSSL証明書を発行します。

- **所要時間**: 数時間〜24時間
- **状態確認**: Firebase Console の Hosting ページで確認可能
- **完了後**: `https://omorisan-fudosan.com` でアクセス可能

---

## 🔄 更新する時

サイトを更新したら、再度デプロイするだけ：

```bash
firebase deploy --only hosting
```

数秒で世界中に配信されます！

---

## 📁 デプロイされるファイル

`firebase.json` で設定されているファイルがデプロイされます：

✅ **デプロイされる:**
- `index.html`
- `properties.html`
- `news.html`
- `works.html`
- `company.html`
- `contact.html`
- `concept.html`
- `login.html`
- `admin-firebase.html`
- `css/`, `js/`, `images/` フォルダ
- `firebase-config.js`

❌ **デプロイされない:**
- `admin.html`（旧バージョン）
- `js/admin.js`（旧バージョン）
- `data/` フォルダ（JSONファイルは不要）
- `README.md`, `FIREBASE_SETUP.md` など

---

## 🛡️ セキュリティ設定

### 管理画面のアクセス制限

管理画面（`admin-firebase.html`）は、ログインしないとアクセスできません。

でも念のため、`.htaccess` や Firebase Hosting のルールでさらに保護することもできます：

`firebase.json` に追加：

```json
{
  "hosting": {
    "redirects": [
      {
        "source": "/admin",
        "destination": "/login",
        "type": 301
      }
    ]
  }
}
```

---

## 💰 料金について

### 無料枠（Spark プラン）

- **ストレージ**: 10GB
- **転送量**: 360MB/日（約10GB/月）
- **ビルド時間**: 制限なし

### 小規模サイトなら完全無料

- 画像: 50枚 × 500KB = 25MB
- HTML/CSS/JS: 5MB
- 月間訪問者: 1,000人 × 2MB = 2GB/月

→ **無料枠で十分！**

### もし超えたら

有料プラン（Blaze）に自動アップグレードされますが：
- 超過分のみ課金（従量課金）
- 1GB あたり $0.15（約15円）
- 月額固定費なし

---

## 🔧 トラブルシューティング

### デプロイエラー

**エラー**: `Error: HTTP Error: 401, Request had invalid authentication credentials.`

**解決策**:
```bash
firebase logout
firebase login
firebase deploy
```

### DNS設定が反映されない

- **所要時間**: 最大48時間（通常は数時間）
- **確認方法**: `nslookup omorisan-fudosan.com`
- **対処**: 気長に待つ

### SSL証明書が発行されない

- DNS設定が正しいか確認
- 24時間以上待ってもダメな場合は、Firebase Console で「再試行」

---

## 📊 アクセス解析

Firebase Hosting では、以下の情報が自動で記録されます：

1. Firebase Console → Hosting → 使用状況
   - リクエスト数
   - 転送量
   - エラー率

2. Google Analytics との連携も可能

---

## 🎯 おすすめの運用フロー

### 1. 開発

ローカルで開発・確認

```bash
# Live Server などでローカル確認
python3 -m http.server 8000
```

### 2. テスト

Firebase Hosting にデプロイ

```bash
firebase deploy --only hosting
```

### 3. 確認

デプロイされたサイトを確認
- `https://your-project.web.app`

### 4. 本番

独自ドメインでアクセス
- `https://omorisan-fudosan.com`

---

## 📞 サポート

わからないことがあれば：

- [Firebase Hosting ドキュメント](https://firebase.google.com/docs/hosting)
- [カスタムドメイン設定ガイド](https://firebase.google.com/docs/hosting/custom-domain)
- Firebase Console のサポートチャット

---

## ✅ チェックリスト

デプロイ前の確認：

- [ ] Firebase プロジェクトを作成した
- [ ] `firebase-config.js` を設定した
- [ ] Authentication を有効化した
- [ ] Firestore を作成した
- [ ] Storage を有効化した
- [ ] 管理画面で動作確認した
- [ ] `.firebaserc` のプロジェクトIDを変更した
- [ ] `firebase deploy` を実行した

独自ドメイン設定：

- [ ] ドメインを取得した
- [ ] Firebase Console でドメインを追加した
- [ ] DNS設定を追加した
- [ ] SSL証明書が発行されるのを待った
- [ ] `https://your-domain.com` でアクセスできた

---

## 🎉 完了！

これで、おもりさん不動産のWebサイトが独自ドメインで公開されました！

管理画面から簡単に物件やお知らせを追加できます。

更新したら `firebase deploy` するだけで、すぐに反映されます。
