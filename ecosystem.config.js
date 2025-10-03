export default {
    apps: [{
      name: 'shopify-app',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/shopify-app',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork'
    }]
};