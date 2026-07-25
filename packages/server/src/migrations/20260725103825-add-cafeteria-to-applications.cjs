'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    // 1. Insertar el registro de la aplicación Cafetería con ID 4
    await queryInterface.bulkInsert('applications', [
      {
        id: 4,
        app_name: 'Cafetería',
        description: 'Sistema de Cafetería NV Logroño',
      },
    ]);

    // 2. PostgreSQL, actualizamos la secuencia del ID para que el autoincremento
    // no intente usar un ID ocupado en la siguiente inserción automática
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(
        `SELECT setval(pg_get_serial_sequence('applications', 'id'), COALESCE((SELECT MAX(id) FROM applications), 1));`
      );
    }
  },

  async down(queryInterface, _Sequelize) {
    // Eliminar la aplicación con ID 4 en caso de rollback
    await queryInterface.bulkDelete('applications', { id: 4 }, {});
  },
};