
/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */
/* eslint-disable @typescript-eslint/no-var-requires */

import gulp from "gulp";
import ts from "gulp-typescript";
import sourcemaps from "gulp-sourcemaps";
import merge from "merge-stream";

const { dest, series } = gulp;

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

// Build package with provided Typescript project.
const doBuild = (tsProject, outDir) => {
  var tsResult = tsProject.src().pipe(sourcemaps.init()).pipe(tsProject());

  return merge(tsResult, tsResult.js)
    .pipe(sourcemaps.write("."))
    .pipe(dest(`dist/${outDir}`));
};

export default series(buildCommonJs, buildEsm);
