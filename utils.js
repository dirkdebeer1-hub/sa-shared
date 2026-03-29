/* SA Accountants Shared Utils v1.3.3
   Master copy — edit ONLY in this repo (dirkdebeer1-hub/sa-shared)
   Loaded by: Payroll, Tax, Company Sec, Home Dashboard modules
   DO NOT edit copies in individual module repos — they will be deleted */
'use strict';

var SA_DASHBOARD_URL = 'https://sa-home-dashboard.vercel.app';
var IS_DASHBOARD = (window.location.hostname === 'sa-home-dashboard.vercel.app');

/* ── Supabase JS client (loaded from CDN) ──
   Each module's index.html must load this BEFORE sa-shared/utils.js:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
*/

/* Global supabase client — set by each module's config.js */
var _supabaseClient = null;

function createSupabaseClient(url, key) {
  return window.supabase.createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'sa_platform_session'
    }
  });
}

/* ── Auth helpers ── */
async function signIn(email, password) {
  var result = await _supabaseClient.auth.signInWithPassword({ email: email, password: password });
  if (result.error) throw result.error;
  return result.data;
}

async function signOut() {
  await _supabaseClient.auth.signOut();
  window.location.href = SA_DASHBOARD_URL;
}

async function getSession() {
  var result = await _supabaseClient.auth.getSession();
  return result.data.session;
}

async function requireAuth() {
  try {
    if (!_supabaseClient) {
      console.error('[SA Platform] requireAuth: _supabaseClient is null');
      if (IS_DASHBOARD) { showLoginScreen(); return false; }
      window.location.href = SA_DASHBOARD_URL + '?redirect=' + encodeURIComponent(window.location.href);
      return false;
    }

    /* Step 1: Check URL for token handoff (sat/srt params from dashboard) */
    var params = new URLSearchParams(window.location.search);
    var sat = params.get('sat');
    var srt = params.get('srt');
    if (sat && srt) {
      try {
        await _supabaseClient.auth.setSession({
          access_token: sat,
          refresh_token: srt
        });
        console.info('[SA Platform] Session established via token handoff');
        /* Strip tokens from URL */
        params.delete('sat');
        params.delete('srt');
        var cleanUrl = window.location.pathname;
        var remaining = params.toString();
        if (remaining) cleanUrl += '?' + remaining;
        window.history.replaceState({}, '', cleanUrl);
        return true;
      } catch(e) {
        console.warn('[SA Platform] Token handoff failed:', e);
      }
    }

    /* Step 2: Check existing local session */
    var session = await getSession();
    console.info('[SA Platform] Session:', session ? 'valid (user: ' + session.user.email + ')' : 'none');
    if (session) return true;

    /* Step 3: No session — if dashboard, show login. Otherwise redirect to dashboard. */
    if (IS_DASHBOARD) {
      showLoginScreen();
      return false;
    }
    window.location.href = SA_DASHBOARD_URL + '?redirect=' + encodeURIComponent(window.location.href);
    return false;

  } catch(err) {
    console.error('[SA Platform] requireAuth error:', err);
    if (IS_DASHBOARD) { showLoginScreen(); return false; }
    window.location.href = SA_DASHBOARD_URL + '?redirect=' + encodeURIComponent(window.location.href);
    return false;
  }
}

/* ── Supabase REST fetch — always uses JWT session token ── */
async function sbFetch(url, options) {
  var session = await getSession();
  var token = session ? session.access_token : SUPABASE_KEY;
  var headers = Object.assign({
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }, (options && options.headers) || {});
  return fetch(url, Object.assign({}, options, { headers: headers }));
}

/* ── Updated apiFetch — uses JWT not APP_SECRET ── */
async function apiFetch(params) {
  var session = await getSession();
  var headers = { 'Content-Type': 'application/json' };
  if (session) {
    headers['Authorization'] = 'Bearer ' + session.access_token;
  }
  var url = API + '?' + new URLSearchParams(params).toString();
  var res = await fetch(url, { headers: headers });
  if (!res.ok) throw new Error('API error: ' + res.status);
  return res.json();
}

/* ── Formatting helpers ── */
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

/* ── Login screen ── */
function showLoginScreen() {
  document.body.innerHTML = `
    <div style="
      min-height:100vh;
      background:var(--primary,#1F3654);
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:Arial,sans-serif;
    ">
      <div style="
        background:#fff;
        border-radius:12px;
        padding:48px 40px;
        width:100%;
        max-width:400px;
        box-shadow:0 20px 60px rgba(0,0,0,0.3);
        text-align:center;
      ">
        <div style="
          width:64px;height:64px;
          background:var(--primary,#1F3654);
          border-radius:12px;
          margin:0 auto 24px;
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="color:#fff;font-size:24px;font-weight:700">SA</span>
        </div>
        <h1 style="
          font-size:20px;
          font-weight:700;
          color:#1F3654;
          margin:0 0 4px;
        ">SA Accountants</h1>
        <p style="
          font-size:13px;
          color:#718096;
          margin:0 0 32px;
        ">Practice Platform</p>

        <div id="loginError" style="
          display:none;
          background:#fff5f5;
          border:1px solid #fed7d7;
          color:#c53030;
          padding:10px 14px;
          border-radius:6px;
          font-size:13px;
          margin-bottom:16px;
          text-align:left;
        "></div>

        <input id="loginEmail" type="email"
          placeholder="Email address"
          value="dirkdebeer1@gmail.com"
          style="
            width:100%;
            padding:12px 14px;
            border:1px solid #D0D5DD;
            border-radius:6px;
            font-size:14px;
            margin-bottom:12px;
            box-sizing:border-box;
            outline:none;
          "
        />
        <input id="loginPassword" type="password"
          placeholder="Password"
          style="
            width:100%;
            padding:12px 14px;
            border:1px solid #D0D5DD;
            border-radius:6px;
            font-size:14px;
            margin-bottom:24px;
            box-sizing:border-box;
            outline:none;
          "
        />
        <button id="loginBtn" onclick="handleLogin()" style="
          width:100%;
          padding:13px;
          background:#1F3654;
          color:#fff;
          border:none;
          border-radius:6px;
          font-size:14px;
          font-weight:700;
          cursor:pointer;
        ">Sign In</button>

        <p style="margin:20px 0 0;font-size:12px;color:#718096">
          South African Accountants CC &middot; Yzerfontein
        </p>
      </div>
    </div>
  `;

  /* Enter key submits */
  setTimeout(function() {
    var pw = document.getElementById('loginPassword');
    if (pw) pw.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleLogin();
    });
  }, 100);
}

async function handleLogin() {
  var btn = document.getElementById('loginBtn');
  var errDiv = document.getElementById('loginError');
  var email = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;

  btn.textContent = 'Signing in\u2026';
  btn.disabled = true;
  errDiv.style.display = 'none';

  try {
    var data = await signIn(email, password);
    /* Check if there's a redirect target (another module sent us here) */
    var params = new URLSearchParams(window.location.search);
    var redirect = params.get('redirect');
    if (redirect && data.session) {
      /* Pass tokens to target module */
      var sep = redirect.indexOf('?') >= 0 ? '&' : '?';
      window.location.href = redirect + sep +
        'sat=' + encodeURIComponent(data.session.access_token) +
        '&srt=' + encodeURIComponent(data.session.refresh_token);
      return;
    }
    /* No redirect — just reload (dashboard stays on dashboard) */
    window.location.reload();
  } catch(err) {
    errDiv.textContent = 'Incorrect email or password. Please try again.';
    errDiv.style.display = 'block';
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
}

/* ── End SA Shared Utils v1.3.3 ── */
window._SA_SHARED_UTILS_VERSION = '1.3.3';
