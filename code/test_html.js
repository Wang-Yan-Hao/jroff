const Jroff = require('../dist/jroff.js');

// Instantiate a new generator
var generator = new Jroff.HTMLGenerator();
// Generate the HTML output
var result = generator.generate('.Op Fl 0 Ns Op Ar octal', 'doc');

console.log(result)