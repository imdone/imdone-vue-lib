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

  function filterList(listCallback, searchString) {
    var list = listCallback()
    if (searchString.length > 1) {
        return list.filter(value => value.text.includes(searchString.substring(1)))
    }
    return list
  }
  
  CodeMirror.defineOption('autoSuggest', [], function (cm, configs) {
    function showList (cm, change) {
        
          for (var i = 0, len = configs.length; i < len; i++) {
              var searchString = ''
              var startChar = configs[i].startChar
              var replaceFrom = change.from.ch
              for (var ch = change.from.ch; ch >= 0; ch--) {
                  var searchString = cm.getRange({...change.from, ch}, {...change.from, ch: change.from.ch + 1})
                  if (searchString.startsWith(' ')) {
                      searchString = searchString.substring(1)
                      replaceFrom = ch + 2
                      break
                  } else if (ch === 0) {
                      replaceFrom = 1
                      break
                  }
              }

              if (searchString.startsWith(startChar)) {
                  cm.showHint({
                      completeSingle: false,
                      hint: function (cm, options) {
                          var cur = cm.getCursor(),
                              token = cm.getTokenAt(cur);
                          var end = token.end;
                          if (configs[i]) return {
                              list: filterList(configs[i].listCallback, searchString),
                              from: CodeMirror.Pos(cur.line, replaceFrom),
                              to: CodeMirror.Pos(cur.line, end)
                          };
                      }
                  });
              }
          }
      }
          
      cm.on("keyup", function (cm, event) {
        if (event.key !== 'Backspace') return
        // console.log('event:', event)
        // console.log('cursor:', cm.getCursor())
        var cur = cm.getCursor()
        var change = {from: cur, to: cur}
        showList(cm, change)
      })

      cm.on('inputRead', showList);
  });
});