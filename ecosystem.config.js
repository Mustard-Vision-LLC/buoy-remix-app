export default {
    apps: [{
      name: 'fishook-remix-app',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/prod',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }]
};