const path = require("path");

const root = path.resolve(__dirname, "src");

module.exports = {
  root,
  build: {
    outDir: path.resolve(__dirname, "templates/assets/build"),
    emptyOutDir: true,
    assetsDir: "",
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: path.resolve(root, "main.js"),
        "page-home": path.resolve(root, "pages/home.js"),
        "page-outline": path.resolve(root, "pages/outline.js"),
        "page-post": path.resolve(root, "pages/post.js"),
        "page-category-intro": path.resolve(root, "pages/category-intro.js"),
        "page-category-news": path.resolve(root, "pages/category-news.js"),
        "page-docsme": path.resolve(root, "pages/docsme.js"),
        "page-category-projects": path.resolve(root, "styles/page-category-projects.css"),
        "page-category-project": path.resolve(root, "styles/page-category-project.css"),
        "page-category-news-single": path.resolve(root, "styles/page-category-news-single.css"),
        "page-tag": path.resolve(root, "styles/page-tag.css"),
        "page-links": path.resolve(root, "styles/page-links.css"),
        "page-history": path.resolve(root, "styles/page-history.css"),
        "page-single": path.resolve(root, "styles/page-single.css")
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]"
      }
    }
  }
};
