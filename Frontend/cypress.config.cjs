const { defineConfig } = require('cypress');

module.exports = defineConfig({
  component: {
    devServer: { framework: 'react', bundler: 'vite' },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
    supportFile: 'cypress/support/component.js',
  },
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
    supportFile: 'cypress/support/e2e.js',
  },
});
