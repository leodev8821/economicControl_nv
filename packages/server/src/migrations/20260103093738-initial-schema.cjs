'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Crear tabla ROLES (Necesaria para Users)
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });

    // 2. Crear tabla WEEKS (Necesaria para Incomes, Outcomes y Reports)
    await queryInterface.createTable('weeks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      week_start: { type: Sequelize.STRING, allowNull: false, unique: true },
      week_end: { type: Sequelize.STRING, allowNull: false, unique: true },
    });

    // 3. Crear tabla USERS (Depende de Roles)
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_name: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'roles', key: 'role_name' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      username: { type: Sequelize.STRING, unique: true, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
    });

    // 4. Crear tabla CASH (Bóvedas/Cajas)
    await queryInterface.createTable('cashes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      actual_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
    });

    // 5. Crear tabla PERSONS
    await queryInterface.createTable('persons', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      dni: { type: Sequelize.STRING, allowNull: false, unique: true },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
    });

    // 6. Crear tabla INCOMES (Depende de Person, Week y Cash)
    await queryInterface.createTable('incomes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      source: { type: Sequelize.STRING, allowNull: false },
      date: { type: Sequelize.DATE, allowNull: false },
      person_id: {
        type: Sequelize.INTEGER,
        references: { model: 'persons', key: 'id' },
        onDelete: 'CASCADE',
      },
      week_id: {
        type: Sequelize.INTEGER,
        references: { model: 'weeks', key: 'id' },
      },
      cash_id: {
        type: Sequelize.INTEGER,
        references: { model: 'cashes', key: 'id' },
      },
    });

    // 7. Crear tabla OUTCOMES (Depende de Week y Cash)
    await queryInterface.createTable('outcomes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      description: { type: Sequelize.TEXT },
      category: { type: Sequelize.STRING, allowNull: false },
      date: { type: Sequelize.DATE, allowNull: false },
      week_id: {
        type: Sequelize.INTEGER,
        references: { model: 'weeks', key: 'id' },
      },
      cash_id: {
        type: Sequelize.INTEGER,
        references: { model: 'cashes', key: 'id' },
      },
    });

    // 8. Crear tabla CASH_DENOMINATIONS
    await queryInterface.createTable('cash_denominations', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      denomination_value: { type: Sequelize.STRING, allowNull: false, unique: true },
      quantity: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
    });

    // 9. Crear tabla REPORTS
    await queryInterface.createTable('reports', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      week_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'weeks', key: 'id' },
      },
      total_income: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      total_outcome: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
      net_balance: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar en orden inverso para evitar errores de restricción
    await queryInterface.dropTable('reports');
    await queryInterface.dropTable('cash_denominations');
    await queryInterface.dropTable('outcomes');
    await queryInterface.dropTable('incomes');
    await queryInterface.dropTable('persons');
    await queryInterface.dropTable('cashes');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('weeks');
    await queryInterface.dropTable('roles');
  }
};