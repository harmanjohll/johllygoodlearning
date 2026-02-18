// ============================================================
//  SCIENCE RENDER — Interactive renderers for science questions
// ============================================================

function renderScienceQuestion(card, q) {
  switch (q.type) {
    case 'science-mcq': renderScienceMCQ(card, q); return true;
    default: return false;
  }
}

function renderScienceMCQ(card, q) {
  var html = '<div style="font-size:36px;margin-bottom:8px">\uD83E\uDD14</div>';
  html += '<div class="question-text" style="font-size:20px">' + q.text + '</div>';
  html += '<div class="answer-options" style="flex-direction:column;margin-top:16px">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escSci(o) + '\', \'' + escSci(q.answer) + '\', this)" style="font-size:16px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function escSci(str) {
  return String(str).replace(/'/g, "\\'");
}
