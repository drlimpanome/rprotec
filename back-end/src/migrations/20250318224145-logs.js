// migrations/20251018-create-app-logs.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("app_logs", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
      },

      level: { type: Sequelize.STRING(32), allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: true },
      context: { type: Sequelize.STRING(128), allowNull: true },
      service: { type: Sequelize.STRING(128), allowNull: true },

      client_id: { type: Sequelize.STRING(64), allowNull: true },
      list_id: { type: Sequelize.JSON, allowNull: true },
      list_group_id: { type: Sequelize.JSON, allowNull: true },

      data: { type: Sequelize.JSON, allowNull: true },

      created_at: { type: Sequelize.DATE, allowNull: true },
      updated_at: { type: Sequelize.DATE, allowNull: true },
    });

    // Índices úteis (opcional, não obrigatório, mas prático):
    await queryInterface.addIndex("app_logs", ["level"], {
      name: "idx_app_logs_level",
    });
    await queryInterface.addIndex("app_logs", ["service"], {
      name: "idx_app_logs_service",
    });
    await queryInterface.addIndex("app_logs", ["client_id"], {
      name: "idx_app_logs_client",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("app_logs", "idx_app_logs_level");
    await queryInterface.removeIndex("app_logs", "idx_app_logs_service");
    await queryInterface.removeIndex("app_logs", "idx_app_logs_client");

    await queryInterface.dropTable("app_logs");
  },
};
