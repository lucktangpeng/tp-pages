const { src, dest, series, parallel, watch } = require("gulp");
const del = require("del");
const loadPlugins = require("gulp-load-plugins");
const Plugins = loadPlugins();
const browser = require("browser-sync");
const bs = browser.create();

const cwd = process.cwd();

const confg = require(`${cwd}/pages.config.js`);

const style = () => {
  return (
    src("src/assets/styles/*.scss", { base: "src" })
      .pipe(Plugins.sass())
      .pipe(Plugins.cleanCss())
      // .pipe(Plugins.rename({ extname: ".min.css" }))
      .pipe(dest("dist"))
  );
};

const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(Plugins.babel({ presets: [require("@babel/preset-env")] }))
    .pipe(Plugins.uglify())
    .pipe(dest("dist"));
};

const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(Plugins.swig({ data: confg.data }))
    .pipe(dest("dist"));
};

const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(Plugins.imagemin())
    .pipe(dest("dist"));
};

const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(Plugins.imagemin())
    .pipe(dest("dist"));
};

const other = () => {
  return src("public", { base: "public" }).pipe(dest("dist"));
};

const useref = () => {
  return src("dist/*.html", { base: "dist" })
    .pipe(Plugins.if(/\.js$/, Plugins.uglify()))
    .pipe(Plugins.if(/\.css$/, Plugins.cleanCss()))
    .pipe(Plugins.if(/\.html$/, Plugins.htmlmin({ collapseWhitespace: true })))
    .pipe(dest("dist"));
};

const clean = () => {
  return del(["dist"]);
};

const serve = () => {
  watch("src/assets/styles/**", style),
    watch("src/assets/scripts/*.js", script),
    watch("src/*.html", page),
    watch(
      ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
      bs.reload
    );
  bs.init({
    notify: false,
    port: 4008,
    files: "dist/**",
    server: {
      baseDir: "dist",
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
};

const start = parallel(style, script, page);
const bulid_start = parallel(style, script, page, image, font, other);
const dev = series(clean, start, serve);
const build = series(clean, bulid_start, useref);

module.exports = {
  dev,
  build,
  clean,
  serve,
};
