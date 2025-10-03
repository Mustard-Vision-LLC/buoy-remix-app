module.exports = {
    apps: [{
      name: 'fishook-remix-app',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/prod',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      instances: 1,
      exec_mode: 'fork'
    }]
};