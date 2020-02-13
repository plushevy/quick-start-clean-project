"use strict";

let gulp = require("gulp");
let plumber = require("gulp-plumber");
let sourcemap = require("gulp-sourcemaps");
let sass = require("gulp-sass");
let postcss = require("gulp-postcss");
let autoprefixer = require("autoprefixer");
let server = require("browser-sync").create();
let csso = require("gulp-csso");
let rename = require("gulp-rename");
let imagemin = require("gulp-imagemin");
let webp = require("gulp-webp");
let svgstore = require("gulp-svgstore");
let posthtml = require("gulp-posthtml");
let include = require("posthtml-include");
let del = require("del");
let uglify = require("gulp-uglify");
let concat = require("gulp-concat");


// установить SVGsprite инлайново в любом файле
//<div style="display:none">
//<include src="build/img/sprite.svg"></include>
//</div>


let config = {
  src: '.',
  build: './build',
  html: {
    src: '/*.html',
    dest: '/'
  },
  templates: {
    src: '/templates/*.html',
  },
  style: {
    watch: '/sass/**/*.scss',
    src: '/sass/style.scss',
    dest: '/css/'
  },
  fonts: {
    // src: '/fonts/**.{woff,woff2}',
    src: '/fonts/**',
    dest: '/fonts/',
  },
  js: {
    files: [
      './js/jquery-3.3.1.js',
      './js/main.js'
    ],
    dest: '/js/',
    src: '/js/**',

  },
  css: {
    src: '/css/*',
    dest: '/css/'
  },
  img: {
    src: '/img/**',
    watch: '/img/**/*.{png,jpg,svg}',
    webp: '/img/**/*.{png,jpg}', // в webp
    dest: '/img/'
  },
  svgsprite: {
    src: '/img/icons/icon-*.svg', // svg для спрайта
    dest: '/img/'
  }
};

gulp.task("css", function () {
  return gulp.src(config.src + config.style.src)
    .pipe(plumber())
    // если не нужны sourcemap - выключаем
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    // просто переименовывыет в min, если надо обьединить - concat
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest(config.build + config.style.dest))
    .pipe(server.stream());
});

gulp.task("js", function () {
  return gulp.src(config.js.files)
    // если нужны sourcemaps надо установить npm i gulp-sourcemap --save-dev
    // .pipe(sourcemaps.init())
    .pipe(uglify())
    // rename просто переименовыыет файлы
    // .pipe(rename({
    //   suffix: '.min'
    // }))
    // concat - сжимает в один
    .pipe(concat('main.min.js'))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.build + config.js.dest));
});

gulp.task("images", function () {
  return gulp.src(config.src + config.img.watch)
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: false
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(gulp.dest(config.src + config.img.dest));
});

gulp.task("webp", function () {
  return gulp.src(config.src + config.img.webp)
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest(config.build + config.img.dest));
});

gulp.task("sprite", function () {
  return gulp.src(config.src + config.svgsprite.src)
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest(config.build + config.svgsprite.dest));
});

gulp.task("html", function () {
  return gulp.src(config.src + config.html.src)
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(config.build))
    .pipe(server.stream());
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task('copy', function () {
  return gulp.src([
      config.src + config.fonts.src,
      config.src + config.img.src,
      // config.src + config.js.src,
      // config.src + config.html.src,
      config.src + '/.htaccess',
      config.src + '/robots.txt'
    ], {
      base: config.src
    })
    .pipe(gulp.dest(config.build + config.html.dest));
});

gulp.task("server", function () {
  server.init({
    server: config.build,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch(config.src + config.style.watch, gulp.series("css"));
  gulp.watch(config.src + config.js.src, gulp.series("js", "refresh"));
  gulp.watch(config.src + config.svgsprite.src, gulp.series("sprite", "html", "refresh"));
  gulp.watch(config.src + config.html.src, gulp.series("html", "refresh"));
  gulp.watch(config.src + config.templates.src, gulp.series("html", "refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series("clean", "copy", "css", "js", "sprite", "html"));
gulp.task("start", gulp.series("build", "server"));
