'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Actualizar "Leader" a "Líder"
      await queryInterface.bulkUpdate(
        'roles',
        { role_name: 'Líder' },
        { role_name: 'Leader' },
        { transaction }
      );

      // 2. Actualizar "Usuario" a "Miembro"
      await queryInterface.bulkUpdate(
        'roles',
        { role_name: 'Miembro' },
        { role_name: 'Usuario' },
        { transaction }
      );
      
      console.log('✅ Roles renombrados: Leader -> Líder, Usuario -> Miembro');
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Revertir los cambios en caso de rollback
      await queryInterface.bulkUpdate(
        'roles',
        { role_name: 'Leader' },
        { role_name: 'Líder' },
        { transaction }
      );

      await queryInterface.bulkUpdate(
        'roles',
        { role_name: 'USUARIO' },
        { role_name: 'Miembro' },
        { transaction }
      );
    });
  }
};
