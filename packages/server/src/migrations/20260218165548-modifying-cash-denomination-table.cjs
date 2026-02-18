'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Añadir columna cash_id (permitiendo NULL temporalmente)
      await queryInterface.addColumn('cash_denominations', 'cash_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'cashes', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }, { transaction });

      // 2. Limpiar restricciones antiguas de unicidad
      // Probamos con los nombres más comunes que genera Sequelize/Postgres
      const constraints = [
        'cash_denominations_denomination_value_key',
        'cash_denominations_denomination_value_unique',
        'denomination_value_unique_idx'
      ];
      
      for (const constraint of constraints) {
        await queryInterface.sequelize.query(
          `ALTER TABLE cash_denominations DROP CONSTRAINT IF EXISTS "${constraint}"`,
          { transaction }
        ).catch(() => {}); // Ignorar si no existe
      }

      // 3. Convertir tipo de dato con CAST explícito
      await queryInterface.sequelize.query(
        'ALTER TABLE cash_denominations ALTER COLUMN denomination_value TYPE DECIMAL(10,2) USING denomination_value::numeric',
        { transaction }
      );

      // 4. Asignar los datos actuales a la caja "General" (ID 1)
      await queryInterface.sequelize.query(
        'UPDATE cash_denominations SET cash_id = 1 WHERE cash_id IS NULL',
        { transaction }
      );

      // 5. Ahora que tienen ID 1, hacemos que la columna sea obligatoria
      await queryInterface.changeColumn('cash_denominations', 'cash_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction });

      // 6. Crear las denominaciones para la caja "CAFETERIA" (ID 2)
      // Usamos quantity = 0 para la nueva caja, sin tocar los datos de la caja 1
      await queryInterface.sequelize.query(
        `INSERT INTO cash_denominations (cash_id, denomination_value, quantity)
         SELECT 2, denomination_value, 0.00 FROM cash_denominations WHERE cash_id = 1`,
        { transaction }
      );

      // 7. Crear el nuevo índice único compuesto
      await queryInterface.addIndex('cash_denominations', ['cash_id', 'denomination_value'], {
        unique: true,
        name: 'cash_denominations_cash_id_denomination_value_unique',
        transaction
      });

      await transaction.commit();
      console.log('✅ Migración completada con éxito en producción.');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en la migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // El rollback eliminaría todo lo de la caja 2 y volvería a la estructura original
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('DELETE FROM cash_denominations WHERE cash_id = 2', { transaction });
      await queryInterface.removeIndex('cash_denominations', 'cash_id_denomination_value_unique', { transaction });
      await queryInterface.sequelize.query(
        'ALTER TABLE cash_denominations ALTER COLUMN denomination_value TYPE VARCHAR(100)', 
        { transaction }
      );
      await queryInterface.removeColumn('cash_denominations', 'cash_id', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};