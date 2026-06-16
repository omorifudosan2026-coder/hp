const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

const db = admin.firestore();
const REGION = "asia-northeast1";
const AUTOREPLY_RATE_LIMIT_MS = 5 * 60 * 1000;

const contactNotifyEmail = defineString("CONTACT_NOTIFY_EMAIL", {
  description: "Contact form notification recipient email address",
});

const COMPANY = {
  name: "大森不動産",
  tel: "06-4862-7770",
  fax: "06-7635-8798",
  email: "info@omorifudosan.jp",
  hours: "9:00〜18:00",
  closed: "水、祝",
  addressLines: [
    "〒532-0026",
    "大阪府大阪市淀川区塚本2丁目2-23",
    "シャンティー塚本108",
  ],
};

const CONSULT_TYPES = new Set(["free", "renovation", "investment"]);
const CONSULT_TYPE_LABELS = {
  free: "無料相談",
  renovation: "リフォーム込み相談",
  investment: "投資・活用相談",
};

const LIMITS = {
  name: 100,
  furigana: 100,
  email: 254,
  phone: 30,
  inquiryType: 100,
  message: 5000,
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trimField(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validatePayload(data) {
  if (!data || typeof data !== "object") {
    throw new HttpsError("invalid-argument", "送信データが不正です。");
  }

  const name = trimField(data.name, LIMITS.name);
  const furigana = trimField(data.furigana, LIMITS.furigana);
  const email = trimField(data.email, LIMITS.email);
  const phone = trimField(data.phone, LIMITS.phone);
  const consultType = trimField(data.consultType, 20);
  const inquiryType = trimField(data.inquiryType, LIMITS.inquiryType);
  const message = trimField(data.message, LIMITS.message);
  const submissionId = trimField(data.submissionId, 64);

  if (!name || !furigana || !email || !phone || !consultType || !inquiryType || !message) {
    throw new HttpsError("invalid-argument", "必須項目をすべて入力してください。");
  }

  if (!CONSULT_TYPES.has(consultType)) {
    throw new HttpsError("invalid-argument", "相談の種類を選択してください。");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new HttpsError("invalid-argument", "有効なメールアドレスを入力してください。");
  }

  if (!submissionId || submissionId.length < 8) {
    throw new HttpsError("invalid-argument", "送信 ID が不正です。");
  }

  return {
    name,
    furigana,
    email,
    phone,
    consultType,
    inquiryType,
    message,
    submissionId,
  };
}

function buildNotificationHtml(payload) {
  const consultLabel = CONSULT_TYPE_LABELS[payload.consultType] || payload.consultType;

  return [
    "<p>Webサイトのお問い合わせフォームから送信がありました。</p>",
    "<table cellpadding=\"6\" cellspacing=\"0\" border=\"0\">",
    `<tr><th align="left">相談の種類</th><td>${escapeHtml(consultLabel)}</td></tr>`,
    `<tr><th align="left">お名前</th><td>${escapeHtml(payload.name)}</td></tr>`,
    `<tr><th align="left">フリガナ</th><td>${escapeHtml(payload.furigana)}</td></tr>`,
    `<tr><th align="left">メール</th><td>${escapeHtml(payload.email)}</td></tr>`,
    `<tr><th align="left">電話</th><td>${escapeHtml(payload.phone)}</td></tr>`,
    `<tr><th align="left">相談内容の詳細</th><td>${escapeHtml(payload.inquiryType)}</td></tr>`,
    "</table>",
    "<p><strong>ご相談内容</strong></p>",
    `<p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>`,
  ].join("");
}

function buildAutoReplyHtml(payload) {
  const consultLabel = CONSULT_TYPE_LABELS[payload.consultType] || payload.consultType;
  const addressHtml = COMPANY.addressLines.map((line) => escapeHtml(line)).join("<br>");

  return [
    `<p>${escapeHtml(payload.name)} 様</p>`,
    "<p>この度は大森不動産へお問い合わせいただき、ありがとうございます。<br>",
    "以下の内容で受付いたしました。担当者より折り返しご連絡いたします。</p>",
    "<table cellpadding=\"6\" cellspacing=\"0\" border=\"0\">",
    `<tr><th align="left">相談の種類</th><td>${escapeHtml(consultLabel)}</td></tr>`,
    `<tr><th align="left">相談内容の詳細</th><td>${escapeHtml(payload.inquiryType)}</td></tr>`,
    `<tr><th align="left">お電話番号</th><td>${escapeHtml(payload.phone)}</td></tr>`,
    "</table>",
    "<p><strong>ご相談内容</strong></p>",
    `<p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>`,
    "<hr>",
    "<p>お急ぎの場合はお電話でも承ります。</p>",
    "<p>",
    `TEL: ${escapeHtml(COMPANY.tel)}<br>`,
    `E-MAIL: ${escapeHtml(COMPANY.email)}<br>`,
    `${addressHtml}<br>`,
    `営業時間: ${escapeHtml(COMPANY.hours)}（定休日: ${escapeHtml(COMPANY.closed)}）`,
    "</p>",
    "<p style=\"font-size:12px;color:#666\">",
    "※ このメールは送信専用です。返信いただいてもお答えできません。<br>",
    "※ 心当たりのない場合は、お手数ですが破棄してください。",
    "</p>",
    `<p>${escapeHtml(COMPANY.name)}</p>`,
  ].join("");
}

function emailHash(email) {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 32);
}

async function assertAutoreplyRateLimit(email) {
  const ref = db.collection("rateLimits").doc(`autoreply:${emailHash(email)}`);

  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    const now = Date.now();

    if (snap.exists) {
      const lastSentAt = snap.data().lastSentAt;
      const lastMs = lastSentAt && typeof lastSentAt.toMillis === "function"
        ? lastSentAt.toMillis()
        : 0;

      if (now - lastMs < AUTOREPLY_RATE_LIMIT_MS) {
        throw new HttpsError(
          "resource-exhausted",
          "短時間に複数回送信されています。しばらく時間をおいて再度お試しください。"
        );
      }
    }

    transaction.set(ref, {
      lastSentAt: admin.firestore.Timestamp.now(),
    });
  });
}

exports.submitContact = onCall({ region: REGION }, async (request) => {
  const payload = validatePayload(request.data);
  const notifyTo = contactNotifyEmail.value().trim();

  if (!notifyTo) {
    throw new HttpsError(
      "failed-precondition",
      "通知先メールアドレスが設定されていません。管理者にお問い合わせください。"
    );
  }

  const inquiryRef = db.collection("inquiries").doc(payload.submissionId);
  const existing = await inquiryRef.get();
  if (existing.exists) {
    return { ok: true, alreadySubmitted: true };
  }

  await assertAutoreplyRateLimit(payload.email);

  const inquiryData = {
    name: payload.name,
    furigana: payload.furigana,
    email: payload.email,
    phone: payload.phone,
    consultType: payload.consultType,
    inquiryType: payload.inquiryType,
    message: payload.message,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    status: "new",
  };

  const mailRef = db.collection("mail").doc(`${payload.submissionId}-notify`);
  const mailData = {
    to: [notifyTo],
    message: {
      subject: `【お問い合わせ】${payload.name} 様`,
      html: buildNotificationHtml(payload),
    },
  };

  const autoReplyRef = db.collection("mail").doc(`${payload.submissionId}-autoreply`);
  const autoReplyData = {
    to: [payload.email],
    message: {
      subject: "【大森不動産】お問い合わせを受け付けました",
      html: buildAutoReplyHtml(payload),
    },
  };

  const batch = db.batch();
  batch.set(inquiryRef, inquiryData);
  batch.set(mailRef, mailData, { merge: false });
  batch.set(autoReplyRef, autoReplyData, { merge: false });
  await batch.commit();

  return { ok: true, alreadySubmitted: false };
});
