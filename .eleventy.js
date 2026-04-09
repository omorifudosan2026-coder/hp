module.exports = function (eleventyConfig) {
  // Passthrough: JS/images/firebase-config をそのまま _site/ にコピー
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "images": "images" });
  eleventyConfig.addPassthroughCopy({ "firebase-config.js": "firebase-config.js" });

  // CSS は postcss-cli でビルドするため passthrough しない（main.css を出力）

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
