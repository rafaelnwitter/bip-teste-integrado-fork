const {
  shareAll,
  withModuleFederationPlugin,
} = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'mfeBeneficios',

  exposes: {
    './BeneficiosModule': './projects/mfe-beneficios/src/app/beneficio.routes.ts',
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
