'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    const tableInfo = await queryInterface.describeTable('roles');
    if (tableInfo.application) {
      await queryInterface.removeColumn('roles', 'application');
    }
    
    // 1. Añadir campos faltantes a la tabla 'users'
    await queryInterface.addColumn('users', 'email', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('users', 'phone', { type: Sequelize.STRING, allowNull: true });

    // 2. Crear tabla APPLICATIONS
    await queryInterface.createTable('applications', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      app_name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.STRING, allowNull: true }
    });

    await queryInterface.bulkInsert('applications', [
      { app_name: 'Todas', description: 'Todas las aplicaciones' },
      { app_name: 'Finanzas', description: 'Sistema de control financiero' },
      { app_name: 'Consolidación', description: 'Sistema de consolidación de miembros' }
    ]);

    // 3. Crear tabla USER_PERMISSIONS (Relación Usuarios <-> Apps)
    await queryInterface.createTable('user_permissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'applications', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
      }
    }, {
      uniqueKeys: {
        user_app_unique: {
          fields: ['user_id', 'application_id']
        }
      }
    });

    // 4. Crear tablas de Consolidación
    await queryInterface.createTable('networks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
    });

    await queryInterface.createTable('member_registers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING },
      gender: { type: Sequelize.STRING },
      birth_date: { type: Sequelize.DATEONLY },
      status: { type: Sequelize.STRING, defaultValue: 'Soltero/a' },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
    });

    await queryInterface.createTable('consolidations', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      member_register_id: {
        type: Sequelize.INTEGER,
        references: { model: 'member_registers', key: 'id' },
        onDelete: 'SET NULL'
      },
      leader_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL'
      },
      network_id: {
        type: Sequelize.INTEGER,
        references: { model: 'networks', key: 'id' },
        onDelete: 'SET NULL'
      },
      church_visit_date: { type: Sequelize.DATE },
      call_date: { type: Sequelize.DATE },
      visit_date: { type: Sequelize.DATE },
      observations: { type: Sequelize.STRING },
      invited_by: { type: Sequelize.STRING },
      clasification: { type: Sequelize.STRING, allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
    });
  }
};