'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
        ALTER TABLE incomes 
        ALTER COLUMN "date" TYPE DATE 
        USING "date"::date;
      `
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `
        ALTER TABLE incomes 
        ALTER COLUMN "date" TYPE TIMESTAMPTZ 
        USING "date"::timestamptz;
      `
    );
  }
};
