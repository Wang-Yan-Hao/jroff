/**
 * Jroff 0.0.1 <http://roperzh.github.io/jroff.js>
 * Copyright (c)2015 Roberto Dip <http://roperzh.com>
 * @license Distributed under MIT license
 * @module Jroff
 */

(function (root, factory) {
    if(typeof define === 'function' && define.amd) {
      // AMD module loader is available, define the module and its dependencies using define()
      define([], factory);
    } else if(typeof module === 'object' && module.exports) {
      // CommonJS environment (e.g., Node.js), export the module using module.exports
      module.exports = factory();
    } else {
      // Browser global scope, assign the module to the global object (root)
      root.Jroff = factory();
    }
  }(this, function () { //eslint-disable-line max-statements, ESLint (JS format checker)
      "use strict"; // Enables a stricter set of rules for parsing and executing JavaScript code.
