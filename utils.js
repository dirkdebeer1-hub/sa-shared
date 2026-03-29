/* SA Accountants Shared Utils v1.2.0
   Master copy — edit ONLY in this repo (dirkdebeer1-hub/sa-shared)
   Loaded by: Payroll, Tax, Company Sec, Home Dashboard modules
   DO NOT edit copies in individual module repos — they will be deleted */
'use strict';

function fmt(n) {
  var v = parseFloat(n) || 0;
  return 'R ' + v.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(n) {
  var v = parseFloat(n) || 0;
  return v.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseSalaryInput(val) {
  return parseFloat(String(val || '').replace(/\s/g, '').replace(',', '.')) || 0;
}

function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + (type || '') + ' show';
  setTimeout(function() { t.className = 'toast'; }, 3500);
}

function apiFetch(params) {
  var headers = { 'Content-Type': 'application/json' };
  if (typeof APP_SECRET !== 'undefined') {
    headers['x-app-secret'] = APP_SECRET;
  }
  var url = API + '?' + new URLSearchParams(params).toString();
  return fetch(url, { headers: headers }).then(function(res) {
    if (!res.ok) throw new Error('API error: ' + res.status);
    return res.json();
  });
}

/* ── End SA Shared Utils v1.2.0 ── */
window._SA_SHARED_UTILS_VERSION = '1.2.0';
