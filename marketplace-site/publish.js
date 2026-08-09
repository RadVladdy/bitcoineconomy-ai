/* The signing + publishing engine shared by /list (kind 38555) and /post
   (kind 38556). No dependencies, no bundle, no backend — the page composes an
   event, a NIP-07 extension signs it, and the browser talks to the four relays
   the directory reads. That is the whole architecture, and it is the same
   "zero proprietary backend" rule the rest of this site holds: if we ran a
   submission endpoint, listing here would require our permission, which is
   precisely what the standard exists to avoid.

   THE KEY NEVER TOUCHES THIS PAGE. window.nostr.signEvent() hands the unsigned
   event to the extension and gets a signed one back; there is no field here to
   paste an nsec into and there must never be one. A site that asks for a secret
   key has taught its readers to hand secret keys to sites.

   Each page supplies a FORM descriptor (fields, how to build tags and content)
   and this file does everything after that. */
(function () {
  'use strict';

  var RELAYS = [
    'wss://nos.lol',
    'wss://relay.primal.net',
    'wss://nostr.bitcoiner.social',
    'wss://relay.damus.io'
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function slugify(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);
  }

  // ---- relay I/O ---------------------------------------------------------

  // Publish and report what the relay SAID. This is deliberately not the same
  // question as whether the event is there afterwards — see readBack.
  function publishTo(url, ev, timeoutMs) {
    timeoutMs = timeoutMs || 9000;
    return new Promise(function (resolve) {
      var ws, done = false, timer;
      function finish(status, detail) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { if (ws) ws.close(); } catch (e) {}
        resolve({ url: url, status: status, detail: detail || '' });
      }
      timer = setTimeout(function () { finish('timeout', 'no answer in ' + Math.round(timeoutMs / 1000) + 's'); }, timeoutMs);
      try { ws = new WebSocket(url); } catch (e) { return finish('error', String((e && e.message) || e)); }
      ws.onopen = function () { ws.send(JSON.stringify(['EVENT', ev])); };
      ws.onmessage = function (m) {
        var d;
        try { d = JSON.parse(m.data); } catch (e) { return; }
        if (d[0] === 'OK' && d[1] === ev.id) finish(d[2] ? 'accepted' : 'rejected', d[3] || '');
        if (d[0] === 'NOTICE') finish('rejected', String(d[1] || 'relay notice'));
      };
      ws.onerror = function () { finish('error', 'could not connect'); };
      ws.onclose = function () { finish('error', 'closed before answering'); };
    });
  }

  // The only proof. A relay can answer OK and still drop the event — this
  // project has measured exactly that on relay.damus.io — so every publish is
  // followed by a per-relay read of the id, one relay at a time. Never a
  // Promise.any across relays: that cannot tell 4-of-4 from 1-of-4.
  function readBack(url, id, timeoutMs) {
    timeoutMs = timeoutMs || 7000;
    return new Promise(function (resolve) {
      var ws, done = false, found = false, timer;
      var sub = 'rb' + Math.random().toString(36).slice(2, 10);
      function finish(status) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { if (ws) ws.close(); } catch (e) {}
        resolve({ url: url, status: status });
      }
      timer = setTimeout(function () { finish(found ? 'landed' : 'timeout'); }, timeoutMs);
      try { ws = new WebSocket(url); } catch (e) { return finish('error'); }
      ws.onopen = function () { ws.send(JSON.stringify(['REQ', sub, { ids: [id] }])); };
      ws.onmessage = function (m) {
        var d;
        try { d = JSON.parse(m.data); } catch (e) { return; }
        if (d[0] === 'EVENT' && d[1] === sub && d[2] && d[2].id === id) found = true;
        if (d[0] === 'EOSE' && d[1] === sub) finish(found ? 'landed' : 'not-found');
        if (d[0] === 'CLOSED' && d[1] === sub) finish(found ? 'landed' : 'not-found');
      };
      ws.onerror = function () { finish('error'); };
      ws.onclose = function () { finish(found ? 'landed' : 'error'); };
    });
  }

  // ---- the page ----------------------------------------------------------

  function init(FORM) {
    var form = $('#pubform');
    var preview = $('#ev-json');
    var pvNote = $('#pv-note');
    var signBtn = $('#sign');
    var errBox = $('#form-errors');
    var results = $('#results');
    var pubkey = null;

    // --- repeatable rows ---
    $$('.rep[data-rep]').forEach(function (wrap) {
      var add = $('.addbtn', wrap);
      function row(value) {
        var div = document.createElement('div');
        div.className = 'rep-row';
        var inp = document.createElement('input');
        inp.type = 'url';
        inp.className = 'mono rep-input';
        inp.placeholder = wrap.dataset.placeholder || '';
        inp.value = value || '';
        inp.addEventListener('input', render);
        var x = document.createElement('button');
        x.type = 'button';
        x.className = 'xbtn';
        x.textContent = '×';
        x.setAttribute('aria-label', 'Remove this entry');
        x.addEventListener('click', function () { div.remove(); render(); });
        div.appendChild(inp);
        div.appendChild(x);
        wrap.insertBefore(div, add);
        return inp;
      }
      wrap._addRow = row;
      add.addEventListener('click', function () { row('').focus(); });
      row('');   // always start with one
    });

    // --- category → subcategory ---
    var catSel = $('#f-k'), subSel = $('#f-sub');
    if (catSel && subSel) {
      catSel.addEventListener('change', function () {
        var subs = (FORM.categories[catSel.value] || {}).subcategories || [];
        subSel.innerHTML = '<option value="">— none —</option>' +
          subs.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('');
        subSel.disabled = !subs.length;
        if (FORM.onCategoryChange) FORM.onCategoryChange(catSel.value);
        render();
      });
    }

    // --- auto-slug the d tag from the name/title, until the user edits it ---
    var dField = $('#f-d'), srcField = FORM.slugSource ? $(FORM.slugSource) : null;
    var dTouched = false;
    if (dField) dField.addEventListener('input', function () { dTouched = true; render(); });
    if (srcField && dField) {
      srcField.addEventListener('input', function () {
        if (!dTouched) dField.value = slugify(srcField.value);
        render();
      });
    }

    // --- live preview ---
    function collect() {
      var v = {};
      $$('[data-f]', form).forEach(function (el) {
        if (el.type === 'checkbox') {
          v[el.dataset.f] = v[el.dataset.f] || [];
          if (el.checked) v[el.dataset.f].push(el.value);
        } else {
          v[el.dataset.f] = el.value.trim();
        }
      });
      $$('.rep[data-rep]').forEach(function (wrap) {
        v[wrap.dataset.rep] = $$('.rep-input', wrap)
          .map(function (i) { return i.value.trim(); })
          .filter(Boolean);
      });
      return v;
    }

    function render() {
      var v = collect();
      var built = FORM.build(v);
      var ev = {
        kind: FORM.kind,
        created_at: Math.floor(Date.now() / 1000),
        tags: built.tags,
        content: built.content
      };
      if (pubkey) ev.pubkey = pubkey;
      preview.textContent = JSON.stringify(ev, null, 2);
      pvNote.innerHTML = pubkey
        ? 'Unsigned, as it will be handed to your extension. Your key signs it there — <b>never here</b>.'
        : 'Unsigned, and <b>pubkey is missing until you connect</b> — your extension fills it in.';
      var errs = FORM.validate(v);
      signBtn.disabled = errs.length > 0 || !pubkey;
      if (errs.length) {
        errBox.innerHTML = errs.map(function (e) { return '<div class="errline">' + esc(e) + '</div>'; }).join('');
        errBox.hidden = false;
      } else {
        errBox.hidden = true;
        errBox.innerHTML = '';
      }
      return { ev: ev, errs: errs };
    }

    $$('[data-f]', form).forEach(function (el) {
      el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', render);
    });

    // --- connect (NIP-07) ---
    var connectBtn = $('#connect');
    var whoami = $('#whoami');

    // Show the help, but NEVER disable the button. Extensions inject
    // window.nostr at wildly different times, and some only after a user
    // gesture — so a permanent "no signer found" is a page that lies to
    // anyone who installs one and comes back to the tab, with no way to
    // retry short of a reload they have no reason to guess at.
    function noExtension() {
      $('#nokey').hidden = false;
      connectBtn.disabled = false;
      connectBtn.textContent = 'Connect signer — none detected yet, click to retry';
    }

    connectBtn.addEventListener('click', function () {
      if (!window.nostr || !window.nostr.getPublicKey) return noExtension();
      connectBtn.disabled = true;
      connectBtn.textContent = 'Connecting…';
      window.nostr.getPublicKey().then(function (pk) {
        if (!/^[0-9a-f]{64}$/i.test(String(pk || ''))) throw new Error('the extension returned something that is not a 32-byte hex pubkey');
        pubkey = pk;
        $('#nokey').hidden = true;
        whoami.innerHTML = 'Signing as <span class="mono ok">' + esc(pk.slice(0, 12)) + '…' + esc(pk.slice(-6)) + '</span>';
        whoami.hidden = false;
        connectBtn.hidden = true;
        render();
      }).catch(function (e) {
        connectBtn.disabled = false;
        connectBtn.textContent = 'Connect signer';
        whoami.innerHTML = '<span class="no">Your extension refused: ' + esc((e && e.message) || e) + '</span>';
        whoami.hidden = false;
      });
    });

    // If no extension is present at all, say so up front rather than letting
    // someone fill in a long form and hit a wall at the end.
    if (!window.nostr) {
      setTimeout(function () { if (!window.nostr) noExtension(); }, 600);
    }

    // --- sign and publish ---
    signBtn.addEventListener('click', function () {
      var r = render();
      if (r.errs.length || !pubkey) return;
      signBtn.disabled = true;
      signBtn.textContent = 'Waiting for your extension…';

      window.nostr.signEvent(r.ev).then(function (signed) {
        if (!signed || !signed.id || !signed.sig) throw new Error('the extension returned an unsigned event');
        signBtn.textContent = 'Publishing…';
        showTable(signed);
        return publishAll(signed);
      }).catch(function (e) {
        signBtn.disabled = false;
        signBtn.textContent = FORM.submitLabel;
        results.hidden = false;
        results.innerHTML = '<div class="result bad"><h3>Not published</h3><p>' +
          esc((e && e.message) || String(e)) +
          '</p><p class="mut">Nothing was sent to any relay.</p></div>';
      });
    });

    function showTable(signed) {
      results.hidden = false;
      results.innerHTML =
        '<h2><span class="hash">#</span>Publishing</h2>' +
        '<p class="sec-sub">Event <span class="mono">' + esc(signed.id.slice(0, 16)) + '…</span> — ' +
        'two columns because they are two different facts. <b>Said</b> is the relay\'s answer. ' +
        '<b>Landed</b> is whether the event reads back from that same relay afterwards. ' +
        'A relay can say OK and still drop it, so only the second column is proof.</p>' +
        '<table class="relays"><thead><tr><th>relay</th><th>said</th><th>landed</th></tr></thead><tbody id="rt">' +
        RELAYS.map(function (u) {
          return '<tr data-u="' + esc(u) + '"><td class="mono">' + esc(u.replace('wss://', '')) +
            '</td><td class="said pend">sending…</td><td class="landed pend">—</td></tr>';
        }).join('') +
        '</tbody></table><div id="verdict"></div>';
    }

    function cell(url, which, cls, text) {
      var row = $('tr[data-u="' + url + '"]', results);
      if (!row) return;
      var td = $('.' + which, row);
      td.className = which + ' ' + cls;
      td.textContent = text;
    }

    function publishAll(signed) {
      // Per relay, and every one of them reported. Publishing to four and
      // announcing success because one answered is the failure mode this
      // whole two-column table exists to make impossible.
      return Promise.all(RELAYS.map(function (url) {
        return publishTo(url, signed).then(function (res) {
          cell(url, 'said',
            res.status === 'accepted' ? 'ok' : (res.status === 'timeout' ? 'wait' : 'no'),
            res.status + (res.detail ? ' — ' + res.detail : ''));
          cell(url, 'landed', 'pend', 'checking…');
          return readBack(url, signed.id).then(function (rb) {
            cell(url, 'landed',
              rb.status === 'landed' ? 'ok' : (rb.status === 'timeout' ? 'wait' : 'no'),
              rb.status);
            return { url: url, said: res.status, landed: rb.status };
          });
        });
      })).then(function (all) {
        var landed = all.filter(function (r) { return r.landed === 'landed'; });
        verdict(signed, landed, all);
      });
    }

    function verdict(signed, landed, all) {
      var n = landed.length, total = all.length;
      var box = $('#verdict');
      var nevent = 'nostr:' + signed.id;
      var lying = all.filter(function (r) { return r.said === 'accepted' && r.landed !== 'landed'; });

      if (n === 0) {
        box.innerHTML = '<div class="result bad"><h3>It did not land anywhere</h3>' +
          '<p>Nothing read back from any of the ' + total + ' relays, so this is <strong>not published</strong> ' +
          'and it will not appear in the directory. Try again, or publish it yourself from code — the spec ' +
          'has a working example.</p></div>';
        signBtn.disabled = false;
        signBtn.textContent = 'Try again';
        return;
      }

      box.innerHTML = '<div class="result good">' +
        '<h3>Landed on ' + n + ' of ' + total + ' relays</h3>' +
        (lying.length
          ? '<p><strong>' + lying.length + ' relay' + (lying.length === 1 ? '' : 's') + ' said OK and did not serve it back</strong> — ' +
            'that is normal and it is why this page checks. What counts is the ' + n + ' that did.</p>'
          : '') +
        '<p>Your event id is <span class="mono">' + esc(signed.id) + '</span>. ' +
        'It is on public relays now — ours is not the only copy and we cannot remove it.</p>' +
        '<p><strong>What happens next:</strong> ' + FORM.nextSteps + '</p>' +
        '<p class="mut">Re-publishing under the same <code class="mono">d</code> (<span class="mono">' +
        esc(signed.tags.filter(function (t) { return t[0] === 'd'; }).map(function (t) { return t[1]; })[0] || '') +
        '</span>) replaces this — that is how you update it later.</p>' +
        '<p><a href="' + esc(FORM.backTo) + '">' + esc(FORM.backLabel) + ' →</a></p>' +
        '</div>';
      signBtn.textContent = 'Published';
      void nevent;
    }

    render();
  }

  window.PUBLISH = { init: init, slugify: slugify, RELAYS: RELAYS, esc: esc };
})();
