'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('roles', 'application', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Por defecto 1 (finance-app) para no romper registros existentes
      comment: '1: finance-app, 2: consolidation-app, 3: future-app'
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('roles', 'application');
  }
};
