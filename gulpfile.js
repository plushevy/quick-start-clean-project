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

// установить SVGsprite инлайново в любом файле
//<div style="display:none">
//<include src="build/img/sprite.svg"></include>
//</div>

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
        src: '/fonts/**.{woff,woff2}',
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
        src: '/img/icon-*.svg', //бере svg для спрайта 
        dest: '/img/'
    }
};

gulp.task('style', function () {
    gulp.src(config.src + config.style.src)
        //из-за бага с plumber тут return нет 
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
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
            imagemin.svgo()
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

// копирование ??
gulp.task('copy', function () {
    return gulp.src([
            config.src + config.fonts.src,
            config.src + config.img.src,
            config.src + config.js.src,
        ], {
            base: config.src
        })
        .pipe(gulp.dest(config.src + config.html.dest));
});

gulp.task('del', function () {
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
    gulp.watch(config.src + config.html.src, ['html']]);

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