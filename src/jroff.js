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

// Different attribute of each token (Token.kind). There is functions to check the text is what attribute (Token.isMacro(), Token.isComment ...).
var COMMENT = 1,
    MACRO = 2,
    IMACRO = 3, // Inline macro
    BREAK = 4,
    TEXT = 5,
    EMPTY = 6,
    ESCAPE = 7;

// Macro list. The macro has a callable function.
// This is used to check wheather the text is a inline macro (isInlineMacro function). So any inline macro you want to add must be add to this lis.
var callableMacros = [
  'Ac', 'Ao', 'Bc', 'Bo', 'Brc', 'Bro', 'Dc', 'Do', 'Ec', 'Eo', 'Fc',
  'Oc', 'Oo', 'Pc', 'Po', 'Qc', 'Qo', 'Sc', 'So', 'Xc', 'Xo', 'Aq',
  'Bq', 'Brq', 'Dq', 'Op', 'Pq', 'Ql', 'Qq', 'Sq', 'Vt', 'Ta', 'Ad',
  'An', 'Ap', 'Ar', 'At', 'Bsx', 'Bx', 'Cd', 'Cm', 'Dv', 'Dx', 'Em',
  'Er', 'Ev', 'Fa', 'Fl', 'Fn', 'Ft', 'Fx', 'Ic', 'Li', 'Lk', 'Ms',
  'Mt', 'Nm', 'Ns', 'Nx', 'Ox', 'Pa', 'Pf', 'Sx', 'Sy', 'Tn', 'Ux',
  'Va', 'Vt', 'Xr', "\\&",
];

/**
 * Wrap all common regexp patterns
 * 
 * This tag indicates that the patterns object is intended to serve as a namespace,
 * grouping related properties or functions together. It helps organize code and
 * provides a logical grouping for the patterns.
 * @namespace
 * This tag specifies an alias or alternative name for the patterns object. 
 * It allows the object to be referred to by a different name in the documentation. 
 * In this case, the alias is set to "patterns."
 * @alias patterns
 * Indicate the version
 * @since 0.0.1
 *
 */
// Use for isMacro function ...
var patterns = {
  // Pattern to match a macro at the beginning of a line
  macro: /^\./,
  
  // Pattern to match the start of a macro, allowing leading spaces
  macroStart: /^.\s*/,
  
  // Pattern to match a lexeme, which can be a newline, whitespace, or a macro followed by a non-whitespace character
  lexeme: /(\n|\s+|^\.\s+\S+)/g,
  
  // Pattern to match comments, which can be escaped quotes or escaped hash symbols
  comment: /(\.)?\\\"|\\#/,
  
  // Pattern to match arguments, which can be double-quoted strings or non-whitespace characters
  arguments: /"(.*?)"|\S+/g,
  
  // Pattern to match a single digit
  number: /[\d]/,
  
  // Pattern to match a real number, which can be a positive or negative integer at the beginning of a line
  realNumber: /(^[\-|\+]?\d)/,
  
  // Pattern to match escape sequences, starting with a backslash followed by any character except a double quote
  escape: /(\\[^\"])/g,
  
  // Pattern to match wrapping quotes at the start and end of a string, allowing optional leading and trailing spaces
  wrappingQuotes: /^\s*?\"([^\"]*)\"\s*?$/g,
  
  // Pattern to match any non-whitespace character
  noWhiteSpace: /\S/,
  
  // Pattern to match a new line, allowing optional leading spaces and tabs
  newLine: /[ \t]*\n/
};

/**
 * Create a new object with all the properties present in an array of n
 * objects.
 *
 * @argument {array} objects to be combined
 *
 * @returns {object} The merged object containing all properties from the input objects.
 *
 * @since 0.0.1
 *
 */
var mergeObjects = function (objects) {
  // Use the `reduce` method to iterate over the objects and accumulate them into a single object
  return objects.reduce(function (memo, object) {
    for(var key in object) {
      // Check if the property belongs to the object itself and not its prototype chain
      if(object.hasOwnProperty(key)) {
        // Assign the property value from the current object to the corresponding property in the `memo` object
        memo[key] = object[key];
      }
    }

    return memo;
  }, {});
};

/**
 * Returns a boolean describing if the token can have nodes
 *
 * @argument {token} token
 *
 * @returns {boolean}
 *
 * @since 0.0.1
 *
 */
// Modes is a collection of sub tokens, useful while parsing ( for example a macro with inline macros ).
var canHaveNodes = function (token) {
  // Check if the kind of the token is one of the specified values: MACRO, IMACRO, ESCAPE. So it have a sub node.
  return [MACRO, IMACRO, ESCAPE].indexOf(token.kind) !== -1
};

var macros = {}; // The macro map, key is the macro name and value is the funciton to extend that macro
var macroLib = null;