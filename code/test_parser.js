const Jroff = require('../dist/jroff.js');

// Instantiate a new parser class
var parser = new Jroff.Parser('.Op Fl lorem ipsum');
// Build the AST
var ast = parser.buildAST();

console.log(ast)