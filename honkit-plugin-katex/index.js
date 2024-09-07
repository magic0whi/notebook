const katex = require('katex');
require('katex/contrib/mhchem');

module.exports = {
  book: {
    assets: "./node_modules/katex/dist",
    js: [],
    css: ["katex.min.css"]
  },
  ebook: {
    assets: "./node_modules/katex/dist",
    css: ["katex.min.css"]
  },
  blocks: {
    math: {
      shortcuts: {
        parsers: ["markdown", "asciidoc", "restructuredtext"],
        start: "$$",
        end: "$$"
      },
      process: function(blk) {
        var tex = blk.body;
        var isInline = !(tex[0] == "\n");
        const macros = {
          "\\abs": "\\@ifstar\\abs@star\\abs@",
          "\\abs@star": "\\left\\lvert#1\\right\\rvert",
          "\\abs@": "\\lvert#1\\rvert"
        };
        var output = katex.renderToString(tex, { displayMode: !isInline, macros });
        return output;
      }
    }
  }
};
