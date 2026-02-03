'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * =========================================================
     * BLOQUE 1: TABLAS COMPARTIDAS / SISTEMA BASE
     * =========================================================
     */

    // 1. Crear tabla ROLES (Compartida por Users y leaders)
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

    /**
     * =========================================================
     * BLOQUE 2: SISTEMA FINANCIERO (NO TOCAR)
     * =========================================================
     */

    // 2. Crear tabla WEEKS
    await queryInterface.createTable('weeks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      week_start: { type: Sequelize.STRING, allowNull: false, unique: true },
      week_end: { type: Sequelize.STRING, allowNull: false, unique: true },
    });

    // 3. Crear tabla USERS (Admin del sistema financiero)
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

    // 5. Crear tabla PERSONS (Entidades financieras / Proveedores / Miembros financieros)
    await queryInterface.createTable('persons', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      dni: { type: Sequelize.STRING, allowNull: false, unique: true },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
    });

    // 6. Crear tabla INCOMES
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

    // 7. Crear tabla OUTCOMES
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

    /**
     * =========================================================
     * BLOQUE 3: SISTEMA DE CONSOLIDACIÓN (NUEVO)
     * =========================================================
     */

    // 10. Tabla NETWORKS
    await queryInterface.createTable('networks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      is_visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    });

    // 11. Tabla leaders (Distinto a Users, pero usa Roles)
    await queryInterface.createTable('leaders', {
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
      },
      username: { type: Sequelize.STRING, unique: true, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
    });

    // 12. Tabla REGISTER-PERSONS (Personas captadas para consolidación)
    await queryInterface.createTable('register_persons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: false },
      phone: { type: Sequelize.STRING(15), unique: true, allowNull: false },
      gender: { type: Sequelize.STRING(1), allowNull: false },
      birth_date: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
    });

    // 13. Tabla CONSOLIDATIONS
    await queryInterface.createTable('consolidations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // FK a Register Person
      register_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'register_persons', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      // FK a Lider
      lider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'leaders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', 
      },
      // FK a Network
      red_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'networks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      church_visit_date: { type: Sequelize.DATE, allowNull: false },
      call_date: { type: Sequelize.DATE, allowNull: true },
      visit_date: { type: Sequelize.DATE, allowNull: true },
      observations: { type: Sequelize.TEXT, allowNull: true },
      invited_by: { type: Sequelize.STRING, allowNull: true },
      clasification: { 
        type: Sequelize.ENUM('new', 'renewal', 'renewal-previous', 'renewal-previous-previous'),
        allowNull: false 
      },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
    });
  },

  async down(queryInterface, _Sequelize) {
    // 1. ELIMINAR SISTEMA CONSOLIDACIÓN (Orden inverso a creación)
    await queryInterface.dropTable('consolidations');
    await queryInterface.dropTable('register_persons');
    await queryInterface.dropTable('leaders');
    await queryInterface.dropTable('networks');

    // 2. ELIMINAR SISTEMA FINANCIERO
    await queryInterface.dropTable('reports');
    await queryInterface.dropTable('cash_denominations');
    await queryInterface.dropTable('outcomes');
    await queryInterface.dropTable('incomes');
    await queryInterface.dropTable('persons');
    await queryInterface.dropTable('cashes');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('weeks');
    
    // 3. ELIMINAR TABLAS BASE
    await queryInterface.dropTable('roles');
  }
};
