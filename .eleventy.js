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
  // Passthrough: JS/images/firebase-config をそのまま _site/ にコピー
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "images": "images" });
  eleventyConfig.addPassthroughCopy({ "firebase-config.js": "firebase-config.js" });
  // robots は src に置いているが、文字列1引数だと cwd の ./robots.txt を探して失敗するため明示する
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // CSS は postcss-cli でビルドするため passthrough しない（main.css を出力）
  // main.css の内容が変わると URL のクエリも変わり、ブラウザキャッシュ事故を避ける
  eleventyConfig.addGlobalData("mainCssCacheBust", () => getMainCssCacheBust());
  eleventyConfig.addWatchTarget("src/css/main.css");

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
