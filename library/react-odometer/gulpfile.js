/* @license Copyright 2024 @polkadot-cloud/library authors & contributors
SPDX-License-Identifier: GPL-3.0-only */
/* eslint-disable @typescript-eslint/no-var-requires */

import gulp from "gulp";
import ts from "gulp-typescript";
import strip from "gulp-strip-comments";
import sourcemaps from "gulp-sourcemaps";
import merge from "merge-stream";
import * as sass from "sass";
import sassFrom from "gulp-sass";

const gulpSass = sassFrom(sass);

const { src, dest, series } = gulp;

const buildComponents = () => {
  var tsProject = ts.createProject("tsconfig.json");
  var tsResult = tsProject.src().pipe(sourcemaps.init()).pipe(tsProject());

  return merge(tsResult, tsResult.js)
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist"));
};

const buildSass = () =>
  src("./src/**/*.scss")
    .pipe(gulpSass({ outputStyle: "compressed" }))
    .pipe(dest("dist"));

const stripComments = () =>
  src("dist/**/*.js").pipe(strip()).pipe(dest("dist"));

export default series(buildSass, buildComponents, stripComments);
