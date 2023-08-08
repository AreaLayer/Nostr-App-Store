if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/path/to/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
      console.log('Service Worker registration failed:', error);
    });
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  const installButton = document.getElementById('install-button');
  installButton.style.display = 'block';
  installButton.addEventListener('click', () => {
    event.prompt();
  });
});
