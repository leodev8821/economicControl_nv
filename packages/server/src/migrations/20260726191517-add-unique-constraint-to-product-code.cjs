'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('products', {
      fields: ['code'],
      type: 'unique',
      name: 'unique_product_code_constraint'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('products', 'unique_product_code_constraint');
  }
};