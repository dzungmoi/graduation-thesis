'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FarmWeeklyUpdates', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      farmId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'UserFarms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      weekStart: { allowNull: false, type: Sequelize.DATEONLY },
      growthStageId: {
        type: Sequelize.INTEGER,
        references: { model: 'GrowthStages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      healthStatus: { type: Sequelize.ENUM('tot', 'trung_binh', 'kem'), defaultValue: 'tot' },
      noteMarkdown: { type: Sequelize.TEXT('long') },
      noteHTML: { type: Sequelize.TEXT('long') },
      image_url: { type: Sequelize.STRING },
      image_file_id: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('FarmWeeklyUpdates', {
      fields: ['farmId', 'weekStart'],
      type: 'unique',
      name: 'uniq_farm_week'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('FarmWeeklyUpdates');
  }
};
