## About
This is the repo forked from [Jroff](https://github.com/roperzh/jroff). The original macro has doc.js (full support for `doc` macros), an.js (full support for `an` macros), and default.js (partial support for groff-native commands). In this repo, I will focus on extending the doc.js to fully support FreeBSD `mdoc` syntax. The below list all macros in `mdoc` and the macro has ": no" string means it is the macro not in the origin [`doc` macro](https://man.freebsd.org/cgi/man.cgi?mdoc(7)) which I need to implement.

1. Dd
2. Dt
3. Os
4. Nm
5. Nd
6. Sh
7. Ss
8. Sx: no, Osx: yes (the `doc` macro has but `mdoc` doesn't have)
9. Xr
10. Tg: no
11. Pp
12. Bd: no
13. Ed: no
14. D1: no
15. Dl: no
16. Ql
17. Bl
18. El
19. It
20. Ta: no
21. Rs
22. %A, %B, %C: no, %D, %I, %J, %N, %O, %P, %Q, %R, %T, %U: no, %V, 
23. Re
24. Pf
25. Ns: no
26. Ap: no
27. Sm: no
28. Bk: no
29. Ek: no
30. Nm
31. Fl
32. Cm
33. Ar
34. Op
35. Oo
36. Oc
37. Ic: no
38. Ev
39. Pa
40. Lb: no
41. In: no
42. Fd: no
43. Ft
44. Fo
45. Fc
46. Fn
47. Fa
48. Vt
49. Va
50. Dv
51. Er: no
52. Ev
53. An
54. Lk: no
55. Mt: no
56. Cd
57. Ad
58. Ms: no
59. Em
60. Sy
61. No: no
62. Bf
63. Ef
64. Dq, Do, Dc
65. Qq, Qo, Qc
66. Sq, So, Sc
67. Pq, Po, Pc
68. Bq, Bo, Bc
69. Brq, Bro, Brc
70. Aq, Ao, Ac
71. Eo, Ec
72. Ex  -std: no
73. Rv  -std: no
74. St
75. At
76. Bx
77. Bsx: no
78. Nx
79. Fx
80. Ox
81. Dx

The main build way is `make build` which will combine the js files into a single jroff.js in the `dist` folder in this order:
1. preamble.js
2. jroff.js
3. macro/*.js
4. postamble.js
All you need is to import the dist/jroff.js then you can use this tool.

The main functionality of the library is to produce an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) ready to
be consumed by a generator.

At the moment, only a single HTML generator has been implemented, but the plan is
to implement several more in the near future.

## Utility function

### Buffer
```
date // Dd

title // Dt
section
volume
sideText
midText

os // Os

name // Nm
firstMeetNm = true
firstMacroSh = true

openTag // Sh, Ss

section // Sh

Bd_unfill // BD, -unfilled or -literal

Bl_type = [] // Bl type, nested Bl type
Bl_tag = [] // Bl tag

meetEscape = false // Escape Character


```

### Function
```
HTMLGenerator.prototype.recurse = function (arr, layer)
HTMLGenerator.prototype.reduceRecursive = function (result, node, layer)
HTMLGenerator.prototype.cleanQuotes = function (str)
HTMLGenerator.prototype.generateTagWithClass = function (name, class_name, content)
HTMLGenerator.prototype.splitHTMLString = function (htmlString)
HTMLGenerator.prototype.generateAlternTag = function (tag1, tag2, c) 
HTMLGenerator.prototype.closeTag = function (tag)
HTMLGenerator.prototype.closeAllTags = function (tags)
HTMLGenerator.prototype.closeTagsUntil = function (limitTag, tags)
HTMLGenerator.prototype.parseArguments = function (args)
HTMLGenerator.prototype.isInsideOfSection = function (section)
HTMLGenerator.prototype.startWithNs = function isWrappedInTag(inputString, tagName) {
  const regexPattern = new RegExp(`^<${tagName}>[\\s\\S]*<\/${tagName}>$`);
  return regexPattern.test(inputString);
}
```
### Variable
```
var COMMENT = 1,
    MACRO = 2,
    IMACRO = 3, // Inline macro
    BREAK = 4,
    TEXT = 5,
    EMPTY = 6,
    ESCAPE = 7;
```

```
var callableMacros = []
var macros = {}
var libKey = {} // Lb macro
var docSections = {} // Dt macro
var architectures = {} // Dt macro
var fontModes = {} // Bf macro
var abbreviations = {} // St macro
var specialCharacter = {} // All macro
```
## Usage
*An annotated version of the code can be found [here](http://www.roperzh.com/jroff/)*

### HTML Generator
Using the generator is fairly simple. You only have to create
a new instance and call the `generate` method every
time you want to parse a string containing groff text.

The `generate` function takes two arguments: the source string and an
optional name from the macro library that will be used to parse the result:

```javascript
// Instantiate a new generator
var generator = new Jroff.HTMLGenerator();
// Generate the HTML output
var result = generator.generate('.Op Fl 0 Ns Op Ar octal', 'doc');
```
This is what we see when we print the result variable:

```html
<span>[<strong>-0 <span>[<i>octal</i>]</span></strong>]</span>
```

### Parser

The parser takes a string as a source, being capable of building an AST
from it. Using the parser is very straightforward, but it is nearly
useless without a generator:

```javascript
// Instantiate a new parser class
var parser = new Jroff.Parser('.Op Fl lorem ipsum');
// Build the AST
var ast = parser.buildAST();
```
This is what we see when we inspect the `ast` variable:

```json
[{
  "value": "Op",
  "kind": 2,
  "nodes": [{
    "value": " ",
    "kind": 5,
    "nodes": []
  }, {
    "value": "Fl",
    "kind": 3,
    "nodes": [{
      "value": " lorem ipsum",
      "kind": 5,
      "nodes": []
    }]
  }]
}]
```

### Defining New Macros

You can define a specific macro for your project by
adding a new item in the `Jroff.macros.defaults` object, using
the macro name as a key and the function with a specific macro
functionality as the value:

```javascript
Jroff.macros.defaults.sp = function (spacing) {
    spacing = spacing || '2';
    return '<hr style="margin-top:' + spacing + 'em;visibility:hidden;">';
};
```
Internally, all macros are defined like this. You can check out `src/macros/defaults.js` for more examples.

## Contributing

For regular development, you need to have `Node.js >=0.10` installed in
your system. Then,

Clone the repository.

```console
git clone git@bitbucket.org:roperzh/jroff_final.git
cd jroff_final
```

Install the required dependencies.

```console
npm install
```

Finally, build your local copy and run the tests.

```console
make all
```

### Brief Description of the Organization of the Code

`dist`: This folder stores the bundled versions of the code.

`src/core`: As the name of the folder suggests, this is the core of the library.
There is no HTML-related code here, only code to parse and build the AST.

`src/generators`: Generators are entities that can consume the AST
generated by the parser and produce an output. At the moment, only one HTML
generator has been implemented.

`src/macros`: Stores macro commands and macro packages.
At the moment, it only supports `an` and `doc` packages.
Macros supported by groff are stored in `default.js`

`src/utils`: Utility functions and miscellany.

### Brief Description of Make Commands

***make dist:*** beautifies and builds minified and concatenated versions
of the code.

***make hint:*** runs [eslint](http://eslint.org/) over the test files
and the concatenated, non-minified version of the code.

***make beautify:*** runs [js-beautify](https://github.com/beautify-web/js-beautify)
over all JavaScript files.

***make doc:*** generates local documentation based on the current version
of the code. This is useful for previewing documentation before publishing it.
See the next section for more details.

### Documenting New Code

This library uses [jsdoc3](https://github.com/jsdoc3/jsdoc) to generate documentation, so all new code must be documented using jsdoc
tags. A useful reference can be found [here](http://usejsdoc.org/index.html).

Also, due to [some limitations](https://github.com/jsdoc3/jsdoc/issues/930) with
jsdoc and [UMD](https://github.com/umdjs/umd), the `@alias` tag must be added to all functions,
constructors, and namespaces manually.

### Generating Documentation

The Makefile includes a useful command that generates and pushes the
documentation onto GitHub and GitHub pages. You can simply run:

```console
make doc-build
```

**Note:** Please make sure to stash or commit all your changes
before generating the documentation.

If you want to preview the changes before pushing the documentation, you can generate
it with the `doc` task and then open `docs/index.html`
on your browser.

An example of this using OS X:

```console
make doc
open docs/index.html
```
### Links


## License

All the code contained in this repository, unless explicitly stated, is
licensed under an MIT license.

A copy of the license can be found in the [LICENSE](LICENSE) file.
