// Registar o Service Worker para suporte PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker registado com sucesso:', registration.scope);
      })
      .catch((error) => {
        console.log('Falha ao registar o Service Worker:', error);
      });
  });
}