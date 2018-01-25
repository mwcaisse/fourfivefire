/// <binding AfterBuild='dist-local' Clean='clean' />
/*
This file is the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. https://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var nunjucksRender = require("gulp-nunjucks-render");
var gulpClean = require("gulp-clean");
var gulpData = require("gulp-data");
var gulpRename = require("gulp-rename");
var merge = require("merge-stream");
var path = require("path");
var environments = require("gulp-environments");

var libs = './src/lib/';
var dist = './dist/';
var stage = "./dist-stage/";
var distLocal = './dist-local/fourfivefire/';
var nunjucksStage = stage + "/nunjucks/";

gulp.task('default', function () {
    // place code for your default task here
});

gulp.task('restore:bulma', function () {
    return gulp.src([
       'node_modules/bulma/css/*.css'
    ]).pipe(gulp.dest(libs + 'bulma/css'));
});

gulp.task('restore:font-awesome', function () {
    var css = gulp.src([
        'node_modules/font-awesome/css/*.*'
    ]).pipe(gulp.dest(libs + 'font-awesome/css'));

    var other = gulp.src([
        'node_modules/font-awesome/fonts/*.*'
    ]).pipe(gulp.dest(libs + 'font-awesome/fonts'));

    return merge(css, other);
});



gulp.task('restore', [
    'restore:bulma',
    'restore:font-awesome'
]);

function getDataForFile(file) {
    var fileName = file.relative.replace(".njk", ".json");
    try {
        return require("./src/data/" + fileName);
    } catch (ex) {
        return {};
    }
}

function manageNunjucksEnvironment(env) {
    if (environments.production()) {
        env.addGlobal("contextRoot", "/");
    } else {
        env.addGlobal("contextRoot", "/fourfivefire/");
    }
}

gulp.task('nunjucks', [
    "nunjucks:stage",
    "nunjucks:render"
]);

gulp.task('nunjucks:render', ["nunjucks:stage"], function () {
    return gulp.src(nunjucksStage + "/**/*.+(html|njk)")
        .pipe(gulpData(getDataForFile))
        .pipe(nunjucksRender({
            path: ["src/templates"],
            manageEnv: manageNunjucksEnvironment
        }))
        .pipe(gulp.dest(dist + "/"));
});

gulp.task("nunjucks:stage", [
    "nunjucks:stage:other"
]);

gulp.task("nunjucks:stage:other", function() {
    return gulp.src(["src/pages/**/*.+(html|njk)", "!src/pages/project.njk"])
        .pipe(gulp.dest(nunjucksStage)); 
});

gulp.task("stage:clean", function() {
    return gulp.src(stage, { read: false }).pipe(gulpClean());
});

gulp.task("dist:clean",
    function() {
        return gulp.src(dist, { read: false }).pipe(gulpClean());
    });

gulp.task('dist:css',
    function() {
        return gulp.src([
            "src/css/**/*.css"
        ]).pipe(gulp.dest(dist + "/css"));
    });

gulp.task('dist:js',
    function () {
        return gulp.src([
            "src/js/**/*.js"
        ]).pipe(gulp.dest(dist + "/js"));
    });

gulp.task('dist:img',
    function () {
        return gulp.src([
            "src/img-fin/**/*.jpg",
            "src/img-fin/**/*.png"
        ]).pipe(gulp.dest(dist + "/img"));
    });

gulp.task('dist:res',
    function() {
        return gulp.src([
            "src/res/**/*"
        ]).pipe(gulp.dest(dist + "/res"));
    }
)

gulp.task('dist:html', ['nunjucks:render'],
    function () {
        return gulp.src([
            "src/**/*.html"
        ]).pipe(gulp.dest(dist + "/"));
    });

gulp.task('dist:lib', ['restore'], 
    function () {
        return gulp.src([
            "src/lib/**/*.*"
        ]).pipe(gulp.dest(dist + "/lib"));
    });

gulp.task('dist-local',
    ['dist'],
    function() {
        return gulp.src(dist + "/**/*").pipe(gulp.dest(distLocal));
    });

gulp.task("dist-local:clean",
    function () {
        return gulp.src(distLocal, { read: false }).pipe(gulpClean());
    });

gulp.task('dist', [
    'dist:css',
    'dist:js',
    'dist:img',
    'dist:res',
    'nunjucks',
    'dist:lib'//,
    //'stage:clean'
]);

gulp.task("clean", [
    "dist:clean",
    "stage:clean",
    "dist-local:clean"
]);