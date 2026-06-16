const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function getMainCssCacheBust() {
  try {
    const cssPath = path.join(process.cwd(), "_site", "css", "main.css");
    const buf = fs.readFileSync(cssPath);
    return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12);
  } catch {
    return "";
  }
}

module.exports = function (eleventyConfig) {
  // 公開URL用: トップは /、それ以外は末尾スラッシュ・末尾 .html を除く（canonical / og:url）
  eleventyConfig.addFilter("canonicalPath", (url) => {
    if (url == null || url === "") return "/";
    let s = String(url).trim();
    if (s === "/" || s === "/index.html") return "/";
    s = s.replace(/\/+$/, "");
    if (s.endsWith(".html")) {
      s = s.slice(0, -5);
    }
    return s && s !== "" ? s : "/";
  });

  // Passthrough: JS/images/firebase-config をそのまま _site/ にコピー
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "images": "images" });
  eleventyConfig.addPassthroughCopy({ "firebase-config.js": "firebase-config.js" });
  eleventyConfig.addPassthroughCopy({ "favicon.ico": "favicon.ico" });
  // robots は src に置いているが、文字列1引数だと cwd の ./robots.txt を探して失敗するため明示する
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // CSS は postcss-cli でビルドするため passthrough しない（main.css を出力）
  // main.css の内容が変わると URL のクエリも変わり、ブラウザキャッシュ事故を避ける
  eleventyConfig.addGlobalData("mainCssCacheBust", () => getMainCssCacheBust());
  eleventyConfig.addWatchTarget("src/css/main.css");
  // Passthrough の更新も開発サーバーで追従させる
  eleventyConfig.addWatchTarget("js");
  eleventyConfig.addWatchTarget("images");
  eleventyConfig.addWatchTarget("firebase-config.js");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
    },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
