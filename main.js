/* Sheet index: mark the part currently crossing the middle of the viewport,
   and open the credential rows while the sheet prints. Everything else on
   this page is HTML and CSS: the credential rows are native <details>, the
   opening is a CSS animation gated by the two-line script in the <head>,
   and the sheet reads correctly with this file blocked. */
(function () {
  'use strict';

  /* Print every credential in full. A closed <details> cannot be opened by
     CSS alone, so open the rows for the print run and close them after. */
  var opened = [];
  window.addEventListener('beforeprint', function () {
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

  function mark(el) {
    if (el === current) return;
    if (current) byId[current.id].removeAttribute('aria-current');
    current = el;
    if (current) byId[current.id].setAttribute('aria-current', 'true');
  }

  var seen = Object.create(null);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      seen[entry.target.id] = entry.isIntersecting;
    });
    var hit = null;
    targets.forEach(function (el) {
      if (seen[el.id]) hit = el;
    });
    mark(hit);
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  targets.forEach(function (el) { io.observe(el); });
})();
