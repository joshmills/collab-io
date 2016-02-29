var cursorPosition = 0;
var linePosition = 0;

// Getting cursor position
(function ($, undefined) {
  $.fn.getCursorPosition = function() {
      var el = $(this).get(0);
      var pos = 0;
      if('selectionStart' in el) {
          pos = el.selectionStart;
      } else if('selection' in document) {
          el.focus();
          var Sel = document.selection.createRange();
          var SelLength = document.selection.createRange().text.length;
          Sel.moveStart('character', -el.value.length);
          pos = Sel.text.length - SelLength;
      }
      return pos;
  }
})(jQuery);

(function ($, undefined) {
    $.fn.setCursorPosition = function(cp) {
        var el = $(this).get(0);
        var rows = el.value.split('\n');
        var prevlen = rows.slice(0, cp.row - 1).join("\n").length;


        var pos = prevlen + cp.cp + 1;
        el.setSelectionRange(pos, pos);
        console.log(prevlen);
    }
})(jQuery);

// Get the line number
function getLineNumber(textarea) {
  return textarea.val().substr(0, textarea[0].selectionStart).split('\n').length;
}

function getCursorInLinePosition(textarea) {
  var lines = textarea.val().substr(0, textarea[0].selectionStart).split('\n');
  var cp = lines[lines.length - 1].length;
  return cp;
}

function getCP(textarea) {
  return {
    row: getLineNumber(textarea),
    cp: getCursorInLinePosition(textarea)
  };
}

$(window).ready(function() { initTextArea(); });
$(window).resize(function() { initTextArea(); });

function initTextArea() {
  var ta = $("#editor");
  var info = $('#info');
  ta.width($(window).width() - 50);
  ta.height($(window).height());
  info.height($(window).height());
}

var socket = io();
$('#editor').bind('input propertychange', function(){
  // Send a text_change event

  var te = $('#editor');
  var ln = getLineNumber($('#editor'));
  socket.emit('text_change', {
    value: {
      row: ln,
      value: $('#editor').val().split('\n')[ln - 1]
    }
  });
});
socket.on('text_update', function(data){

  // Persist cp
  cursorPosition = getCP($('#editor'));

  // Someone has updated the text, update it
  var lines = $('#editor').val().split('\n');
  lines[data.value.row - 1] = data.value.value;
  $('#editor').val(lines.join('\n'));
  console.log(data.value);

  // recover previous cp
  setCursorPosition(cursorPosition);
  console.log(cursorPosition);
});

// Session stuff
socket.on('login', function(data) {
  // We logged in
  $.each(data.connectedUsers, function(username, info) {
    addUserInfo(username, (username == data.you));
  });
});
socket.on('connected', function(data){
  addUserInfo(data.username);
});
socket.on('disconnected', function(data){
  removeUserInfo(data.username);
});

function getCursorLine() {
  return 0;
}
function getCursorColumn() {
  return 0;
}
function setCursorPosition(position) {
  $('#editor').setCursorPosition(position);
}

function addUserInfo(username, active) {
  var classText = "";
  if (active) {
    classText = "active";
  }
  $('#info ul').append($('<li>', { id: username, text: username, class: classText }));
}
function removeUserInfo(username) {
  $('#' + username).remove();
}