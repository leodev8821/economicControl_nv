'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminamos la columna redundante
    await queryInterface.removeColumn('consolidations', 'user_id');
  },

  async down(queryInterface, Sequelize) {
    // Por si necesitas revertir, la añadimos de nuevo
    await queryInterface.addColumn('consolidations', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Temporalmente true para evitar errores de FK al revertir
      references: { model: 'users', key: 'id' }
    });
  }
};