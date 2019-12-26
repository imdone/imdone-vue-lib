/* eslint-disable */
(function (mod) {
  if (typeof exports === 'object' && typeof module === 'object') { // CommonJS
      mod(
          require('codemirror/lib/codemirror'),
          require('codemirror/mode/gfm/gfm'),
          require('codemirror/addon/hint/show-hint')
      );
  }
  else if (typeof define === 'function' && define.amd) { // AMD
      define([
          'codemirror/lib/codemirror',
          'codemirror/mode/gfm/gfm',
          'codemirror/addon/hint/show-hint'
      ], mod);
  }
  else { // Plain browser env
      mod(CodeMirror);
  }
})(function (CodeMirror) {
  'use strict';

  CodeMirror.defineOption('autoSuggest', [], function (cm, value, old) {
      cm.on('inputRead', function (cm, change) {
          
        //   var mode = cm.getModeAt(cm.getCursor());
          for (var i = 0, len = value.length; i < len; i++) {
            //   if (mode.name === value[i].mode && change.text[0] === value[i].startChar) {
              if (change.text[0] === value[i].startChar) {
                  cm.showHint({
                      completeSingle: false,
                      hint: function (cm, options) {
                          var cur = cm.getCursor(),
                              token = cm.getTokenAt(cur);
                          var start = token.start + 1,
                              end = token.end;
                          if (value[i]) return {
                              list: value[i].listCallback(),
                              from: CodeMirror.Pos(cur.line, start),
                              to: CodeMirror.Pos(cur.line, end)
                          };
                      }
                  });
              }
          }
      });
  });
});