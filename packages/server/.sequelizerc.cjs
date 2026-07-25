// packages/server/.sequelizerc
const path = require('path');

module.exports = {
  // USAMOS DIST para la configuración (donde los .js sí existen físicamente)
  //'config': path.resolve('dist', 'config', 'sequelize.config.js'),
  'config': path.resolve('src', 'config', 'database.cjs'),
  
  // USAMOS SRC para las migraciones (porque son .cjs y no se mueven a dist)
  'migrations-path': path.resolve('src', 'migrations'),
  
  'seeders-path': path.resolve('src', 'seeders'),
  'models-path': path.resolve('dist', 'models')
};