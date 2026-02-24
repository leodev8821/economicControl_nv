"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Renombrar tabla
    await queryInterface.renameTable(
      "member_registers",
      "members"
    );

    // 2️⃣ Añadir user_id
    await queryInterface.addColumn("members", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 3️⃣ Añadir visit_date
    await queryInterface.addColumn("members", "visit_date", {
      type: Sequelize.DATE,
      allowNull: true, // temporalmente nullable si ya tienes datos
    });

    // 4️⃣ Crear FK
    await queryInterface.addConstraint("members", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_members_user_id",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

  },

  async down(queryInterface, Sequelize) {
    // Rollback en orden inverso

    await queryInterface.removeIndex(
      "members",
      "members_user_id_unique"
    );

    await queryInterface.removeConstraint(
      "members",
      "fk_members_user_id"
    );

    await queryInterface.removeColumn("members", "visit_date");
    await queryInterface.removeColumn("members", "user_id");

    await queryInterface.renameTable(
      "members",
      "member_registers"
    );
  },
};