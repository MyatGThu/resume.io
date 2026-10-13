/* Run the live span to today, plot each part in as it arrives, mark the
   part crossing the middle of the viewport in the sheet index, and open the
   credential rows while the sheet prints. Everything else on this page is
   HTML and CSS: the credential rows are native <details>, the
   opening is a CSS animation gated by the two-line script in the <head>,
   and the sheet reads correctly with this file blocked. */
(function () {
  'use strict';

  /* The live span runs to today: the axis is January 2019 to January 2027,
     so a month is 1/96 of it. Without this script it runs to the axis end. */
  var live = document.querySelector('.lane[data-state="live"]');
  if (live) {
    var now = new Date();
    var months = (now.getFullYear() - 2019) * 12 + now.getMonth() + now.getDate() / 31;
    live.style.setProperty('--to', Math.min(100, months / 96 * 100).toFixed(2) + '%');
  }

  /* Plot each part as it reaches the reader. Armed only when the tab is
     visible, motion is welcome and the observer exists; otherwise nothing
     waits and the finished sheet is what loads. An element plots once. */
  var root = document.documentElement;
  var plots = Array.prototype.slice.call(document.querySelectorAll('[data-plot]'));
  function land(el) { el.classList.add('is-in'); }
  if (plots.length && 'IntersectionObserver' in window && !document.hidden &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var po = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        land(entry.target);
        po.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    plots.forEach(function (el) { po.observe(el); });
    root.classList.add('is-armed');
  }

  /* Print every credential in full. A closed <details> cannot be opened by
     CSS alone, so open the rows for the print run and close them after. */
  var opened = [];
  window.addEventListener('beforeprint', function () {
    plots.forEach(land);
    opened = Array.prototype.filter.call(
      document.querySelectorAll('details'),
      function (d) { return !d.open; }
    );
    opened.forEach(function (d) { d.open = true; });
  });
  window.addEventListener('afterprint', function () {
    opened.forEach(function (d) { d.open = false; });
    opened = [];
  });

  var links = Array.prototype.slice.call(
    document.querySelectorAll('.index a[href^="#"]')
  );
  if (!links.length || !('IntersectionObserver' in window)) return;

  var byId = {};
  var targets = [];

  links.forEach(function (link) {
    var el = document.getElementById(link.hash.slice(1));
    if (!el) return;
    byId[el.id] = link;
    targets.push(el);
  });
  if (!targets.length) return;

  var current = null;
  var hit = null;

  function mark(el) {
    if (el === current) return;
    if (current) byId[current.id].removeAttribute('aria-current');
    current = el;
    if (current) byId[current.id].setAttribute('aria-current', 'true');
  }

  /* A phone shows three of the six entries; the rest are display:none. A part
     with no entry on screen is marked by the nearest entry above it that is,
     so the underline always names the stretch of the page the reader is in
     and a hidden link is never the one that carries the mark. */
  function nearestShown(el) {
    var i = targets.indexOf(el);
    while (i >= 0 && !byId[targets[i].id].getClientRects().length) i--;
    return i >= 0 ? targets[i] : null;
  }

  function sync() {
    mark(nearestShown(hit));
  }

  var seen = Object.create(null);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      seen[entry.target.id] = entry.isIntersecting;
    });
    hit = null;
    targets.forEach(function (el) {
      if (seen[el.id]) hit = el;
    });
    sync();
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  targets.forEach(function (el) { io.observe(el); });

  /* Turning the phone across the 720px query shows or hides entries. */
  window.addEventListener('resize', sync);
})();
