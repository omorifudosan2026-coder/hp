# Firebase セットアップ手順

おもりさん不動産のWebサイトをFirebaseで動かすための設定手順です。

## 🚀 ステップ1: Firebaseプロジェクトの作成

### 1-1. Firebase Consoleにアクセス
1. [https://console.firebase.google.com/](https://console.firebase.google.com/) にアクセス
2. Googleアカウントでログイン

### 1-2. プロジェクトを作成
1. 「プロジェクトを追加」をクリック
2. プロジェクト名を入力（例: `omori-real-estate`）
3. 「続行」をクリック
4. Google アナリティクス（任意）
   - 不要な場合はオフにしてOK
   - 必要な場合はそのまま進む
5. 「プロジェクトを作成」をクリック
6. 作成完了まで待つ（30秒ほど）

---

## 🌐 ステップ2: Webアプリの追加

### 2-1. Webアプリを登録
1. プロジェクトのホーム画面で「</>」（Web）アイコンをクリック
2. アプリのニックネームを入力（例: `おもりさん不動産`）
3. 「Firebase Hosting」はチェックしない（後で設定可能）
4. 「アプリを登録」をクリック

### 2-2. 設定情報をコピー
表示される設定情報をコピーします：

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:..."
};
```

### 2-3. 設定ファイルを更新
`firebase-config.js` を開いて、コピーした設定情報に置き換えます。

---

## 🔐 ステップ3: Authentication（認証）の設定

### 3-1. Authenticationを有効化
1. 左メニューから「Authentication」をクリック
2. 「始める」ボタンをクリック
3. 「Sign-in method」タブを選択

### 3-2. メール/パスワード認証を有効化
1. 「メール/パスワード」をクリック
2. 「有効にする」をON
3. 「保存」をクリック

### 3-3. 管理者ユーザーを作成
1. 「Users」タブをクリック
2. 「ユーザーを追加」をクリック
3. メールアドレスとパスワードを入力
   - 例: `admin@omorisan.com` / `password123`
4. 「ユーザーを追加」をクリック

**⚠️ このメールアドレスとパスワードは管理画面のログインに使用します。忘れないようにメモしてください。**

---

## 💾 ステップ4: Firestore Database（データベース）の設定

### 4-1. Firestoreを作成
1. 左メニューから「Firestore Database」をクリック
2. 「データベースの作成」をクリック

### 4-2. セキュリティルールを選択
1. 「本番環境モード」を選択
2. 「次へ」をクリック

### 4-3. ロケーションを選択
1. `asia-northeast1`（東京）を選択
2. 「有効にする」をクリック
3. 作成完了まで待つ（1分ほど）

### 4-4. セキュリティルールを設定
1. 「ルール」タブをクリック
2. 以下のルールをコピー＆ペーストして「公開」をクリック

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 管理者のみ書き込み可能、全員読み取り可能
    match /properties/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /news/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /works/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🖼️ ステップ5: Storage（画像保存）の設定

### 5-1. Storageを有効化
1. 左メニューから「Storage」をクリック
2. 「始める」ボタンをクリック

### 5-2. セキュリティルールを確認
1. デフォルトのまま「次へ」をクリック

### 5-3. ロケーションを確認
1. `asia-northeast1`（東京）を選択
2. 「完了」をクリック

### 5-4. セキュリティルールを更新
1. 「ルール」タブをクリック
2. 以下のルールをコピー＆ペーストして「公開」をクリック

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // 管理者のみアップロード可能、全員ダウンロード可能
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ✅ ステップ6: 動作確認

### 6-1. ローカルサーバーを起動
```bash
# VS Codeの拡張機能「Live Server」を使用するか、
# Pythonの場合:
cd /path/to/omori-real-estate
python3 -m http.server 8000

# Node.jsの場合:
npx http-server
```

### 6-2. 管理画面にログイン
1. ブラウザで `http://localhost:8000/login.html` にアクセス
2. ステップ3で作成したメールアドレスとパスワードでログイン
3. ログイン成功すると管理画面に移動します

### 6-3. テストデータを追加
1. 「物件管理」タブで「新規追加」をクリック
2. 物件情報を入力（画像も選択）
3. 「保存」をクリック
4. 保存成功の通知が表示されれば OK！

### 6-4. 公開ページを確認
1. ブラウザで `http://localhost:8000/properties.html` にアクセス
2. 追加した物件が表示されれば成功！

---

## 📱 使い方

### 管理画面
- **ログイン**: `login.html`
- **管理画面**: `admin-firebase.html`

### 公開ページ
- **物件一覧**: `properties.html`
- **お知らせ**: `news.html`

---

## 🎯 次のステップ

### Firebase Hostingで公開する（任意）

サイトを公開したい場合は、Firebase Hostingを使うと無料で簡単に公開できます。

```bash
# Firebase CLIをインストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクトを初期化
firebase init hosting

# デプロイ
firebase deploy --only hosting
```

---

## 🆘 トラブルシューティング

### ログインできない
- メールアドレスとパスワードが正しいか確認
- Firebase Console の Authentication > Users にユーザーが登録されているか確認

### データが表示されない
- ブラウザのコンソール（F12）でエラーを確認
- `firebase-config.js` の設定が正しいか確認
- Firestore のセキュリティルールが正しく設定されているか確認

### 画像がアップロードできない
- Storage のセキュリティルールが正しく設定されているか確認
- ファイルサイズが大きすぎないか確認（5MB以下推奨）

---

## 💰 料金について

Firebaseの無料枠（Sparkプラン）で使用できる範囲：

- **Firestore**: 1GB まで無料
- **Storage**: 5GB まで無料
- **転送量**: 10GB/月 まで無料

小規模サイトであれば完全無料で運用できます。

---

## 📞 サポート

質問や問題があれば、Firebase Consoleのサポートチャットか、公式ドキュメントを参照してください。

- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [Firestore入門](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)
