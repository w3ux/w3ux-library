/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */
/* eslint-disable @typescript-eslint/no-var-requires */

import gulp from "gulp";
import ts from "gulp-typescript";
import sourcemaps from "gulp-sourcemaps";
import merge from "merge-stream";
import * as sass from "sass";
import sassFrom from "gulp-sass";

const gulpSass = sassFrom(sass);
const { src, dest, series } = gulp;

// Buld CommonJS module.
const buildCommonJs = () =>
  doBuild(
    ts.createProject("tsconfig.json", {
      module: "commonjs",
      target: "es2015",
      removeComments: true,
    }),
    "cjs"
  );

// Build ES module.
const buildEsm = () =>
  doBuild(
    ts.createProject("tsconfig.json", {
      module: "esnext",
      target: "esnext",
      removeComments: true,
    }),
    "mjs"
  );

// Build CSS CommonJS.
const buildSassCommonJs = () =>
  src("./src/**/*.css")
    .pipe(gulpSass({ outputStyle: "compressed" }))
    .pipe(dest("dist/cjs"));

// Build CSS ES module.
const buildSassEsm = () =>
  src("./src/**/*.css")
    .pipe(gulpSass({ outputStyle: "compressed" }))
    .pipe(dest("dist/mjs"));

// Build package with provided Typescript project.
const doBuild = (tsProject, outDir) => {
  var tsResult = tsProject.src().pipe(sourcemaps.init()).pipe(tsProject());

  return merge(tsResult, tsResult.js)
    .pipe(sourcemaps.write("."))
    .pipe(dest(`dist/${outDir}`));
};

export default series(buildCommonJs, buildEsm, buildSassCommonJs, buildSassEsm);
