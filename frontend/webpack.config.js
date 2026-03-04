const {
  shareAll,
  withModuleFederationPlugin,
} = require('@angular-architects/module-federation/webpack');

const mfeBeneficiosRemote =
  process.env.MFE_BENEFICIOS_REMOTE || 'http://localhost:4201/remoteEntry.js';

module.exports = withModuleFederationPlugin({
  remotes: {
    mfeBeneficios: mfeBeneficiosRemote,
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
