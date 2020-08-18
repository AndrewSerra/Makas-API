const pm2Config = {
    apps: [
      {
        name: 'Server',
        script: './server.js',
        exec_mode: 'cluster_mode',
        instances: 1,
      },
    ],
  }
  
  module.exports = pm2Config;