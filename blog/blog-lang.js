// Sprachweiche für Blog-Seiten: Artikel existieren als eigene DE- und
// EN-Seiten (kein Wörterbuch wie auf den übrigen Seiten). Passt die gemerkte
// Sprachwahl (aiwm_lang aus i18n.js) nicht zur Seite, leiten wir auf die
// Schwesterseite um. Ohne gespeicherte Wahl bleibt die aufgerufene Seite.
(function () {
  var KEY = 'aiwm_lang';
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (!stored) return;
  var el = document.documentElement;
  var pageLang = el.getAttribute('data-blog-lang');
  var altUrl = el.getAttribute('data-alt-url');
  if (pageLang && altUrl && stored !== pageLang) {
    location.replace(altUrl);
  }
})();
