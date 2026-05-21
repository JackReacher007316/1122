module.exports = {
  apps: [
    {
      name: 'fofa-backend',
      script: 'server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        JWT_SECRET: 'supersecret_jwt_key_for_fantasy_league',
        GEMINI_API_KEY: 'AIzaSyBz3lw6HxrMZ6Dznw0d7aSNb5brI2Fh0Lk',
        DATABASE_URL: 'file:./prisma/dev.db'
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100
    },
    {
      name: 'fofa-tunnel',
      script: 'cloudflared',
      args: 'tunnel --protocol http2 --url http://localhost:3000',
      cwd: './',
      watch: false,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100
    }
  ]
};
