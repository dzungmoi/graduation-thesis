'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserFarms', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cafeVarietyId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'CafeVarieties', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      farmName: { allowNull: false, type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      areaHa: { type: Sequelize.FLOAT },
      plantedAt: { type: Sequelize.DATE },
      note: { type: Sequelize.TEXT('long') },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('UserFarms');
  }
};
