'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Forzar la eliminación del NOT NULL con SQL crudo (Postgres)
    await queryInterface.sequelize.query(
      'ALTER TABLE "consolidations" ALTER COLUMN "network_id" DROP NOT NULL;'
    );
    
    await queryInterface.sequelize.query(
      'ALTER TABLE "consolidations" ALTER COLUMN "how_know_us" DROP NOT NULL;'
    );

    // 3. Añadir el valor 'Otro' al ENUM de call_observations si no existe
    // Nota: PostgreSQL no permite eliminar valores de un ENUM fácilmente, pero sí añadirlos.
    try {
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_consolidations_call_observations" ADD VALUE IF NOT EXISTS 'Otro';`
      );
    } catch (e) {
      console.log("Aviso: No se pudo actualizar el ENUM (puede que no sea Postgres o ya exista el valor).");
    }
  },

  async down(queryInterface, Sequelize) {
    // Revertir a obligatorio (Cuidado: esto fallará si tienes datos NULL en la DB)
    await queryInterface.sequelize.query(
      'ALTER TABLE "consolidations" ALTER COLUMN "network_id" SET NOT NULL;'
    );
    
    await queryInterface.sequelize.query(
      'ALTER TABLE "consolidations" ALTER COLUMN "how_know_us" SET NOT NULL;'
    );
  }
};