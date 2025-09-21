…into the following markdown:

## Hi, Saturn!

Show example code

Show example code

You can use remark for many different things. unified is the core project that transforms content with ASTs. remark adds support for markdown to unified. mdast is the markdown AST that remark uses.

This GitHub repository is a monorepo that contains the following packages:

    remark-parse — plugin to take markdown as input and turn it into a syntax tree (mdast)
    remark-stringify — plugin to take a syntax tree (mdast) and turn it into markdown as output
    remark — unified, remark-parse, and remark-stringify, useful when input and output are markdown
    remark-cli — CLI around remark to inspect and format markdown in scripts

When should I use this?

Depending on the input you have and output you want, you can use different parts of remark. If the input is markdown, you can use remark-parse with unified. If the output is markdown, you can use remark-stringify with unified. If both the input and output are markdown, you can use remark on its own. When you want to inspect and format markdown files in a project, you can use remark-cli.

If you just want to turn markdown into HTML (with maybe a few extensions), we recommend micromark instead.

If you don’t use plugins and want to deal with syntax trees manually, you can use mdast-util-from-markdown and mdast-util-to-markdown.
Plugins

remark plugins deal with markdown. Some popular examples are:

    remark-gfm — add support for GFM (GitHub flavored markdown)
    remark-lint — inspect markdown and warn about inconsistencies
    remark-toc — generate a table of contents
    remark-rehype — turn markdown into HTML

These plugins are exemplary because what they do and how they do it is quite different, respectively to extend markdown syntax, inspect trees, change trees, and transform to other syntax trees.

You can choose from the 150+ plugins that already exist. Here are three good ways to find plugins:

    awesome-remark — selection of the most awesome projects
    List of plugins — list of all plugins
    remark-plugin topic — any tagged repo on GitHub

Some plugins are maintained by us here in the @remarkjs organization while others are maintained by folks elsewhere. Anyone can make remark plugins, so as always when choosing whether to include dependencies in your project, make sure to carefully assess the quality of remark plugins too.
Examples
Example: turning markdown into HTML

remark is an ecosystem around markdown. A different ecosystem is for HTML: rehype. The following example turns markdown into HTML by combining both ecosystems with remark-rehype:

import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

const file = await unified()
.use(remarkParse)
.use(remarkRehype)
.use(rehypeSanitize)
.use(rehypeStringify)
.process('# Hello, Neptune!')

console.log(String(file))

Yields:

<h1>Hello, Neptune!</h1>

Example: support for GFM and frontmatter

remark supports CommonMark by default. Non-standard markdown extensions can be enabled with plugins. The following example adds support for GFM (autolink literals, footnotes, strikethrough, tables, tasklists) and frontmatter (YAML):

import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

const value = `---
layout: solar-system

---

# Hi ~~Mars~~Venus!

`

const file = await unified()
.use(remarkParse)
.use(remarkFrontmatter)
.use(remarkGfm)
.use(remarkRehype)
.use(rehypeStringify)
.process(value)

console.log(String(file))

Yields:

<h1>Hi <del>Mars</del>Venus!</h1>

Example: checking markdown

The following example checks that markdown code style is consistent and follows recommended best practices:

import {remark} from 'remark'
import remarkPresetLintConsistent from 'remark-preset-lint-consistent'
import remarkPresetLintRecommended from 'remark-preset-lint-recommended'
import {reporter} from 'vfile-reporter'

const file = await remark()
.use(remarkPresetLintConsistent)
.use(remarkPresetLintRecommended)
.process('1) Hello, _Jupiter_ and _Neptune_!')

console.error(reporter(file))

Yields:

1:2 warning Unexpected ordered list marker `)`, expected `.` ordered-list-marker-style remark-lint
1:25-1:34 warning Unexpected emphasis marker `*`, expected `_` emphasis-marker remark-lint
[cause]:
1:11-1:20 info Emphasis marker style `'_'` first defined for `'consistent'` here emphasis-marker remark-lint
1:35 warning Unexpected missing final newline character, expected line feed (`\n`) at end of file final-newline remark-lint

⚠ 3 warnings

Example: checking and formatting markdown on the CLI

The following example checks and formats markdown with remark-cli, which is the CLI (command line interface) of remark that you can use in your terminal. This example assumes you’re in a Node.js package.

First, install the CLI and plugins:

npm install --save-dev remark-cli remark-preset-lint-consistent remark-preset-lint-recommended remark-toc

…then add an npm script in your package.json:

/_ … _/
"scripts": {
/_ … _/
"format": "remark . --output",
/_ … _/
},
/_ … _/

    💡 Tip: add ESLint and such in the format script too.

The above change adds a format script, which can be run with npm run format. It runs remark on all markdown files (.) and rewrites them (--output). Run ./node_modules/.bin/remark --help for more info on the CLI.

Then, add a remarkConfig to your package.json to configure remark:

/_ … _/
"remarkConfig": {
"settings": {
"bullet": "_", // Use `_`for list item bullets (default)
      // See <https://github.com/remarkjs/remark/tree/main/packages/remark-stringify> for more options.
    },
    "plugins": [
      "remark-preset-lint-consistent", // Check that markdown is consistent.
      "remark-preset-lint-recommended", // Few recommended rules.
      [
        // Generate a table of contents in`## Contents`
"remark-toc",
{
"heading": "contents"
}
]
]
},
/_ … _/

    👉 Note: you must remove the comments in the above examples when copy/pasting them as comments are not supported in package.json files.

Finally, you can run the npm script to check and format markdown files in your project:

npm run format

Syntax

Markdown is parsed and serialized according to CommonMark. Other plugins can add support for syntax extensions.

We use micromark for our parsing. See its documentation for more information on markdown, CommonMark, and extensions.
Syntax tree

The syntax tree used in remark is mdast. It represents markdown constructs as JSON objects.

This markdown:

## Hello _Pluto_!

…yields the following tree (positional info remove for brevity):

{
type: 'heading',
depth: 2,
children: [
{type: 'text', value: 'Hello '},
{type: 'emphasis', children: [{type: 'text', value: 'Pluto'}]}
{type: 'text', value: '!'}
]
}

Types

The remark organization and the unified collective as a whole is fully typed with TypeScript. Types for mdast are available in @types/mdast.

For TypeScript to work, it is important to type your plugins. For example:

/\*\*

- @import {Root} from 'mdast'
- @import {VFile} from 'vfile'
  \*/

/\*\*

- @typedef Options
- Configuration.
- @property {boolean | null | undefined} [someField]
- Some option (optional).
  \*/

/\*\*

- My plugin.
-
- @param {Options | null | undefined} [options]
- Configuration (optional).
- @returns
- Transform.
  \*/
  export function myRemarkPluginAcceptingOptions(options) {
  /\*\*
- Transform.
-
- @param {Root} tree
- Tree.
- @param {VFile} file
- File
- @returns {undefined}
- Nothing.
  \*/
  return function (tree, file) {
  // Do things.
  }
  }

Compatibility

Projects maintained by the unified collective are compatible with maintained versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of Node. This means we try to keep the current release line compatible with Node.js 16.
Security

As markdown can be turned into HTML and improper use of HTML can open you up to cross-site scripting (XSS) attacks, use of remark can be unsafe. When going to HTML, you will combine remark with rehype, in which case you should use rehype-sanitize.

Another security aspect is DDoS attacks. An attacker could cause a crash or slow down with big files. Crashes can also originate from smaller payloads, often when thousands of things (such as lists or links) are opened. It is wise to cap the accepted size of input (500kb can hold a big book) and to process content in a different thread or worker so that it can be stopped when needed.

Use of remark plugins could also open you up to other attacks. Carefully assess each plugin and the risks involved in using them.

For info on how to submit a report, see our security policy.
