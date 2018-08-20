'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var run = require('run-sequence');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require("gulp-uglify");
var concat = require('gulp-concat');

// установить SVGsprite инлайново в любом файле
//<div style="display:none">
//<include src="build/img/sprite.svg"></include>
//</div>

//<include src = "/emplates/header.html"></include>
//<include src="templates/footer.html"></include>

var config = {
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
    src: '/js/**',
    dest: '/js/',
    files: {
      "jquery-3.3.1": "/js/jquery-3.3.1.js",
      "main.js": "/js/main.js"
    }
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

gulp.task('style', function () {
  gulp.src(config.src + config.style.src)
    //из-за бага с plumber тут return нет
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: ['> 0.1%'],
        cascade: false
      })
    ]))
    .pipe(gulp.dest(config.build + config.style.dest))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest(config.build + config.style.dest))
    .pipe(server.stream());
});

gulp.task('js', function () {
  return gulp.src(config.src + config.js.src)
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.build + config.js.dest))
    .pipe(server.stream());
});

gulp.task('images', function () {
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
      }),
      {
        verbose: true
      }

    ]))
    .pipe(gulp.dest(config.src + config.img.dest));
});

gulp.task('webp', function () {
  return gulp.src(config.src + config.img.webp)
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest(config.src + config.img.dest));
});

gulp.task('sprite', function () {
  return gulp.src(config.src + config.svgsprite.src)
    .pipe(svgstore({
      inLineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest(config.build + config.svgsprite.dest));
});

gulp.task('html', function () {
  return gulp.src(config.src + config.html.src)
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(config.build))
    .pipe(server.stream());
});

// копирование
gulp.task('copy', function () {
  return gulp.src([
      config.src + config.fonts.src,
      config.src + config.img.src,
      config.src + config.js.src,
      config.src + config.html.src,
      config.src + '/robots.txt'
    ], {
      base: config.src
    })
    .pipe(gulp.dest(config.build + config.html.dest));
});

gulp.task('clean', function () {
  return del('build');
});

gulp.task('serve', function () {
  server.init({
    server: config.build
  });

  // от креша после сохраниения в scss
  gulp.watch(config.src + config.style.watch, function () {
    setTimeout(function () {
      gulp.start('style');
    }, 100);
  });
  gulp.watch(config.src + config.html.src, ['html']);
  gulp.watch(config.src + config.templates.src, ['html']);
  gulp.watch(config.src + config.js.src, ['js']);

});

gulp.task('build', function (done) {
  run(
    'clean',
    'copy',
    'style',
    'sprite',
    'html',
    'js',
    done
  );
});
