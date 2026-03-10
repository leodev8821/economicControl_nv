'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // Eliminamos la tabla antigua para empezar de cero
    await queryInterface.dropTable('consolidations', { cascade: true }).catch(() => {
      console.log("La tabla 'consolidations' no existía, procediendo a crearla.");
    });
    
    // Creacion de la tabla con el nuevo esquema
    await queryInterface.createTable('consolidations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'members',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      network_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'networks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      how_know_us: {
        type: Sequelize.ENUM('Amigo/Familiar', 'Internet', 'Redes Sociales', 'Otro'), 
        allowNull: false
      },
      invited_by: {
        type: Sequelize.STRING,
        allowNull: true
      },
      call_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      call_observations: {
        type: Sequelize.ENUM('Interesado', 'No contesta', 'Número no existe', 'No interesado', 'Vive fuera'),
        allowNull: true
      },
      other_observations: {
        type: Sequelize.STRING,
        allowNull: true
      },
      visit_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      visit_observations: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }
    });

    // Índices para mejorar el rendimiento de las búsquedas frecuentes
    await queryInterface.addIndex('consolidations', ['user_id']);
    await queryInterface.addIndex('consolidations', ['member_id']);
    await queryInterface.addIndex('consolidations', ['network_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('consolidations');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_consolidations_how_know_us";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_consolidations_call_observations";');
  }
};