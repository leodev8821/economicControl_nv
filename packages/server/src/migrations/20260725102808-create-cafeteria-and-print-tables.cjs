'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Crear tabla PRODUCTS
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      unit_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 2. Crear tabla BILLS
    await queryInterface.createTable('bills', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: Sequelize.DATE,
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      pay_method: {
        type: Sequelize.ENUM('Efectivo', 'Tarjeta'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 3. Crear tabla BILL_DETAILS (Depende de Bills y Products)
    await queryInterface.createTable('bill_details', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      bill_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bills',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unit_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
    });

    // 4. Crear tabla PRINT_CONFIG
    await queryInterface.createTable('print_config', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_negocio: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cif: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pie_pagina: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ancho_papel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 80,
      },
      font_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      factura_imprime_servidor: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      factura_auto_print: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      impresora_facturas: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      logo_data: {
        type: Sequelize.BLOB('long'),
        allowNull: true,
      },
      logo_tipo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      qr_data: {
        type: Sequelize.BLOB('long'),
        allowNull: true,
      },
      qr_tipo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar en orden inverso por las restricciones de Foreign Key
    await queryInterface.dropTable('print_config');
    await queryInterface.dropTable('bill_details');
    await queryInterface.dropTable('bills');
    await queryInterface.dropTable('products');

    // Si tu dialecto es Postgres, puedes limpiar el ENUM creado
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_bills_pay_method";');
    }
  },
};
