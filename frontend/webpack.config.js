const {
  shareAll,
  withModuleFederationPlugin,
} = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  remotes: {
    mfeBeneficios: 'http://localhost:4201/remoteEntry.js',
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto',
    }),
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true },
    '@angular/common/http': { singleton: true }, 
    '@angular/router': { singleton: true },
    'rxjs': { singleton: true }
  },
});
