// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode("jinja2", function() {
    var keywords = ["and", "as", "block", "endblock", "by", "cycle", "debug", "else", "elif",
      "extends", "filter", "endfilter", "firstof", "for", "set",
      "endfor", "if", "endif", "ifchanged", "endifchanged",
      "ifequal", "endifequal", "ifnotequal",
      "endifnotequal", "in", "include", "load", "not", "now", "or",
      "parsed", "regroup", "reversed", "spaceless",
      "endspaceless", "ssi", "templatetag", "openblock",
      "closeblock", "openvariable", "closevariable",
      "openbrace", "closebrace", "opencomment",
      "closecomment", "widthratio", "url", "with", "endwith",
      "get_current_language", "trans", "endtrans", "noop", "blocktrans",
      "endblocktrans", "get_available_languages",
      "get_current_language_bidi", "plural"],
    operator = /^[+\-*&%=<>!?|~^]/,
    sign = /^[:\[\(\{]/,
    atom = ["true", "false"],
    number = /^(\d[+\-\*\/])?\d+(\.\d+)?/;

    keywords = new RegExp("((" + keywords.join(")|(") + "))\\b");
    atom = new RegExp("((" + atom.join(")|(") + "))\\b");

    function tokenBase (stream, state) {
      var ch = stream.peek();

      if (stream.eat('#')) {
        if (stream.eat('#')) {
          stream.skipToEnd();
          return "comment"
        } else if (stream.peek() == ' ' || stream.match(keywords, false)) {
          state.intag = true;
          state.lineTag = true;
          return "tag";
        }
      }

      //Comment
      if (state.incomment) {
        if(!stream.skipTo("#}")) {
          stream.skipToEnd();
        } else {
          stream.eatWhile(/\#|}/);
          state.incomment = false;
        }
        return "comment";
      //Tag
      } else if (state.intag) {
        //After operator
        if(state.operator) {
          state.operator = false;
          if(stream.match(atom)) {
            return "atom";
          }
          if(stream.match(number)) {
            return "number";
          }
        }
        //After sign
        if(state.sign) {
          state.sign = false;
          if(stream.match(atom)) {
            return "atom";
          }
          if(stream.match(number)) {
            return "number";
          }
        }

        if(state.instring) {
          if(ch == state.instring) {
            state.instring = false;
          }
          stream.next();
          return "string";
        } else if(ch == "'" || ch == '"') {
          state.instring = ch;
          stream.next();
          return "string";
        } else if(stream.match(state.intag + "}") || stream.eat("-") && stream.match(state.intag + "}")) {
          state.intag = false;
          return "tag";
        } else if(stream.match(operator)) {
          state.operator = true;
          return "operator";
        } else if(stream.match(sign)) {
          state.sign = true;
        } else {
          if(stream.eat(/\s/) || stream.sol() || state.lineTag) {
            let result
            if(stream.match(keywords)) {
              state.lineTag = false
              result = "keyword";
            }
            if(stream.match(atom)) {
              result = "atom";
            }
            if(stream.match(number)) {
              result = "number";
            }
            if (state.lineTag && stream.eol()) {
              state.intag = false;
              state.lineTag = false;
            }
            if (result) return result
            if(stream.sol()) {
              stream.next();
            }
          } else {

            stream.next();
          }

        }
        return "variable";
      } else if (stream.eat("{")) {
        if (stream.eat("#")) {
          state.incomment = true;
          if(!stream.skipTo("#}")) {
            stream.skipToEnd();
          } else {
            stream.eatWhile(/\#|}/);
            state.incomment = false;
          }
          return "comment";
        //Open tag
        } else if (ch = stream.eat(/\{|%/)) {
          //Cache close tag
          state.intag = ch;
          if(ch == "{") {
            state.intag = "}";
          }
          stream.eat("-");
          return "tag";
        }
      }
      stream.next();
    };

    return {
      startState: function () {
        return {tokenize: tokenBase};
      },
      token: function (stream, state) {
        return state.tokenize(stream, state);
      },
      blockCommentStart: "{#",
      blockCommentEnd: "#}",
      lineComment: "##",
    };
  });

  CodeMirror.defineMIME("text/jinja2", "jinja2");
});
