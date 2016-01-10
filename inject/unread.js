// From https://github.com/fgnass/inbox-app/blob/master/web/unread.js
/*
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
*/

var electron = require('electron');
var ipc = electron.ipcRenderer;
var click = require('./click');
var seen;

function extractData(ss) {
  var id, avatar, sender, subject;

  var p = ss.parentNode.parentNode.parentNode.parentNode.parentNode;
  var a = p.querySelector('[data-action-data]');
  var action = a.dataset.actionData;
  id = /#.+?:([^"]+)/.exec(action)[1];

  if (id.indexOf('^' === 0)) {
    // Use textContent for clusters
    id = p.textContent.replace(/\W/g, '');
  }

  if (p.classList.contains('full-cluster-item')
    || p.querySelector('.itemIconMarkedDone')
  ) return;


  subject = (p.querySelector('.lt') || p.querySelector('.qG span')).textContent;

  var brand = ss.getAttribute('brand_name');
  if (brand) {
    sender = brand;
    avatar = ss.getAttribute('brand_avatar_url');
  }
  else {
    sender = p.querySelector('[email]').textContent;
    var img = p.querySelector('img');
    if (img) {
      avatar = img.src;
    }
    else {
      var icon = p.querySelector('.pE');
      var bg = getComputedStyle(icon)['background-image'];
      avatar = bg.replace(/url\((.+)\)/, '$1');
    }
  }

  console.log(id, subject);

  return {
    id: id,
    subject: subject,
    sender: ss.textContent,
    avatar: avatar,
    element: ss
  };
}

function getNew(messages) {
  return messages.filter(function(msg) {
    return !seen[msg.id];
  });
}

function getUnreadMessages() {
  if (!document.querySelector('.hn.b4')) return []; // not inside the inbox
  var nodes = Array.prototype.slice.call(document.querySelectorAll('.ss'));
  return nodes.map(extractData).filter(Boolean);
}

function checkState() {
  var messages = getUnreadMessages();
  var count = messages.length;
  ipc.send('unread', '' + count);

  var firstTime = !seen;
  if (firstTime) seen = {};

  getNew(messages).forEach(function(msg) {
    if (!firstTime) {
        var imagePath = 'file://$%pathImage%$icon_256x256.png';
      // Don't show notifications upon startup
      new Notification(msg.sender, {
        tag: msg.id,
        body: msg.subject,
        icon: imagePath
      })
      .addEventListener('click', function(ev) {
        ipc.send('show-window');
        click(msg.element);
      });
    }
    seen[msg.id] = true;
  });

  setTimeout(checkState, 1000);
}

checkState();
