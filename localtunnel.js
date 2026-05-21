// Programmatic Localtunnel client launcher
const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ 
      port: 3000, 
      subdomain: 'fofa-gp' 
    });

    console.log(`[Localtunnel] Tunnel is running at: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('[Localtunnel] Tunnel was closed.');
    });
    
    tunnel.on('error', (err) => {
      console.error('[Localtunnel] Error occurred:', err);
    });

  } catch (err) {
    console.error('[Localtunnel] Failed to initialize tunnel:', err);
  }
})();
