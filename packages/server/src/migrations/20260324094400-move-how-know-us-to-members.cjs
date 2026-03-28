'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Crear las columnas en 'members'
      await queryInterface.addColumn('members', 'how_know_us', {
        type: Sequelize.ENUM('Amigo/Familiar', 'Internet', 'Redes Sociales', 'Otro'),
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('members', 'invited_by', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      // 2. Traspasar los datos de consolidations a members con CAST
      await queryInterface.sequelize.query(`
        UPDATE members m
        SET 
          how_know_us = CAST(c.how_know_us AS TEXT)::"enum_members_how_know_us",
          invited_by = c.invited_by
        FROM consolidations c
        WHERE c.member_id = m.id
          AND (c.how_know_us IS NOT NULL OR c.invited_by IS NOT NULL);
      `, { transaction });

      // 3. Eliminar las columnas viejas de 'consolidations'
      await queryInterface.removeColumn('consolidations', 'how_know_us', { transaction });
      await queryInterface.removeColumn('consolidations', 'invited_by', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Revertir el proceso
      await queryInterface.addColumn('consolidations', 'how_know_us', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('consolidations', 'invited_by', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      // CAST explícito a TEXT para evitar errores al pasar del ENUM de members al STRING de consolidations
      await queryInterface.sequelize.query(`
        UPDATE consolidations c
        SET 
          how_know_us = CAST(m.how_know_us AS TEXT),
          invited_by = m.invited_by
        FROM members m
        WHERE c.member_id = m.id;
      `, { transaction });

      await queryInterface.removeColumn('members', 'how_know_us', { transaction });
      await queryInterface.removeColumn('members', 'invited_by', { transaction });
      
      // NOTA: Para limpiar completamente la DB, idealmente también deberías eliminar el tipo ENUM creado:
      // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_members_how_know_us";', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};