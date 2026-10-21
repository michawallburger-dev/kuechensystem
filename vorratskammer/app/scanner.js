import { state } from './state.js';

const CONTAINER_ID = 'quagga-container';
const HINT_ID = 'scanner-hint';

export function startScanner(onDetected) {
  if (state.quaggaRunning) return;

  const container = document.getElementById(CONTAINER_ID);
  const hint = document.getElementById(HINT_ID);
  if (!container) return;

  container.innerHTML = '';
  if (hint) hint.textContent = 'Kamera wird gestartet…';

  Quagga.init({
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: container,
      constraints: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      area: { top: '20%', right: '10%', left: '10%', bottom: '20%' }
    },
    locator: { patchSize: 'large', halfSample: false },
    numOfWorkers: 0,
    frequency: 5,
    decoder: {
      readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader', 'code_128_reader'],
      multiple: false
    },
    locate: true
  }, err => {
    if (err) {
      console.error('Quagga init error:', err);
      if (hint) hint.textContent = '❌ ' + (err.message || 'Kamera-Fehler');
      return;
    }

    // Quagga's injected video/canvas need explicit sizing inside our container
    container.querySelectorAll('video, canvas').forEach(el => {
      el.style.position = 'absolute';
      el.style.inset = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.objectFit = 'cover';
    });

    Quagga.start();
    state.quaggaRunning = true;
    if (hint) hint.textContent = 'Barcode in den Rahmen halten';

    let cooldown = false;
    Quagga.offDetected();
    Quagga.onDetected(result => {
      if (cooldown || !state.quaggaRunning) return;

      const code = result?.codeResult?.code;
      if (!code) return;

      // Only accept high-confidence reads (lower error = better)
      const errors = (result.codeResult.decodedCodes || [])
        .filter(c => c.error !== undefined)
        .map(c => c.error);
      const avgError = errors.length ? errors.reduce((a, b) => a + b, 0) / errors.length : 1;
      if (avgError > 0.25) return;

      cooldown = true;
      if (hint) hint.textContent = '✅ Erkannt: ' + code;

      setTimeout(() => {
        stopScanner();
        onDetected(code);
      }, 300);
    });
  });
}

export function stopScanner() {
  if (!state.quaggaRunning) return;
  try { Quagga.stop(); } catch (e) {}
  state.quaggaRunning = false;
}
