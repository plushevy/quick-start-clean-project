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
var include = require('posthtml-include'); // инклюдит одни файлы в другие
var run = require('run-sequence');
var del = require('del');


// var sourcemaps = require('gulp-sourcemaps');
// var concat = require('gulp-concat');
// var uglify = require('uglify-js');   - вроде можно и без concat!!!!

// gulp.task('js', function () {
//   gulp.src(path.src.js)
//     .pipe(sourcemaps.init())
//     .pipe(uglify())
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest(path.build.js))
//     .pipe(reload({
//       stream: true
//     }));
// });

// var concat = require('gulp-concat');

// gulp.task('scripts', function () {
//   gulp.src(['./lib/file3.js', './lib/file1.js', './lib/file2.js'])
//     .pipe(concat('all.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest('./dist/'))
// });

// gulp.task('js:build', function () {
//   gulp.src(path.src.js) //Найдем наш main файл
//     .pipe(rigger()) //Прогоним через rigger
//     .pipe(sourcemaps.init()) //Инициализируем sourcemap
//     .pipe(uglify()) //Сожмем наш js
//     .pipe(sourcemaps.write()) //Пропишем карты
//     .pipe(rename({
//       suffix: '.min'
//     })) //добавим суффикс .min к выходному файлу
//     .pipe(gulp.dest(path.build.js)) //выгрузим готовый файл в build
//     .pipe(connect.reload()) //И перезагрузим сервер
// });

// установить SVGsprite инлайново в любом файле
//<div style="display:none">
//<include src="build/img/sprite.svg"></include>
//</div>

//<include src = "../templates/header.html"></include>
//<include src="../templates/footer.html"></include>

var config = {
  src: '.',
  build: './build',
  html: {
    src: '/*.html',
    dest: '/'
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
    dest: '/js/'
  },
  css: {
    src: '/css/*',
    dest: '/css/'
  },
  img: {
    src: '/img/**',
    watch: '/img/**/*.{png,jpg,svg}',
    webp: '/img/**/*.{png,jpg}', // для преобразования в webp
    dest: '/img/'
  },
  svgsprite: {
    src: '/img/icons/icon-*.svg', //бере svg для спрайта
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
    .pipe(gulp.dest(config.build));
});

// копирование
gulp.task('copy', function () {
  return gulp.src([
      config.src + config.fonts.src,
      config.src + config.img.src,
      config.src + config.js.src,
      config.src + '/robots.txt'
    ], {
      base: config.src
    })
    .pipe(gulp.dest(config.build + config.html.dest));
});

gulp.task('clean', function () {
  return del('build');
});

// gulp.task('serve', ['style'], function () {
//     server.init({
//         server: config.src
//     });

//     gulp.watch(config.src + config.style.watch, ['style']);
//     gulp.watch(config.src + config.html.src, server.reload);

// });

gulp.task('serve', function () {
  server.init({
    server: config.build
  });

  gulp.watch(config.src + config.style.watch, ['style']);
  gulp.watch(config.src + config.html.src, ['html']);

});

gulp.task('build', function (done) {
  run(
    'clean',
    'copy',
    'style',
    'sprite',
    'html',
    done
  );
});
