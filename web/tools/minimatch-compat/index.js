"use strict";
// Compat shim for #24: minimatch 11 has no default export, but CommonJS
// callers of minimatch 3/5 call require("minimatch") as a function.
const m = require("minimatch-real");
module.exports = m.minimatch;
Object.assign(module.exports, m);
module.exports.default = m.minimatch;
