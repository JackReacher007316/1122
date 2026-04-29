module.exports = {
  apps: [
    {
      name: 'iiitn-backend',
      script: 'backend/server.js',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'iiitn-tunnel',
      script: './fantasy-league/cloudflared.exe',
      args: 'tunnel --url http://localhost:3000',
      cwd: './'
    }
  ]
};
