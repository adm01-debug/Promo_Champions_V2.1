// Etapa 22 do plano de 50 etapas: extraído de um <script> inline em index.html
// para permitir remover 'unsafe-inline' de script-src na CSP. Comportamento
// idêntico ao original — só mudou de arquivo.
//
// Registro do Service Worker (produção apenas — um SW em dev cacheia chunks
// do Vite e sobrevive a hard-refresh normal, mascarando correções reais).
(function () {
  var isLocalDev = ['localhost', '127.0.0.1'].indexOf(location.hostname) !== -1;
  if (!('serviceWorker' in navigator)) return;

  if (isLocalDev) {
    // Limpa qualquer SW registrado antes deste guard existir.
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      regs.forEach(function (r) { r.unregister(); });
    }).catch(function () {});
  } else {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/pwa-sw.js').catch(function () {});
    });
  }
})();
