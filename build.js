var fs = require("fs"),
    browserify = require("browserify"),
    outputDirectory = "./dist",
    sourceFiles = ["./js/main.js"];

fs.mkdir(outputDirectory, function (err) {
    if (err) {
        console.log("directory exists!! overriding file!!")
    }
    browserify(sourceFiles)
        .transform("babelify", {presets: ["es2015"]})
        .bundle()
        .pipe(fs.createWriteStream("./dist/bundle.js"));
});
