//
// The MIT License (MIT)
//
// Copyright (c) 2016 Rickard Doverfelt
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

var fs = require('fs');
var path = require('path');

var dir = path.resolve(__dirname);

module.exports = function(win) {
  win.once('page-title-updated', function() {
    var wc = win.webContents;
    wc.insertCSS(fs.readFileSync(dir + '/inject/injected.css', 'utf8'));
    wc.executeJavaScript('module.paths.push("' + dir + path.sep + 'node_modules");');
    console.log(fs.readFileSync(dir + '/inject/unread.js', 'utf8').replace('$%pathImage%$', (dir + path.sep).replace('\\', '/')));
	wc.executeJavaScript(fs.readFileSync(dir + '/inject/unread.js', 'utf8').replace('$%pathImage%$', (dir + path.sep).replace('\\', '/')));
    wc.executeJavaScript('setTimeout(checkState, 1000)');
  });
};
