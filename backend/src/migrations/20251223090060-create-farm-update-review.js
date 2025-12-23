'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FarmUpdateReviews', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      updateId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        unique: true,
        references: { model: 'FarmWeeklyUpdates', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      adminId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      rating: { allowNull: false, type: Sequelize.INTEGER },
      comment: { type: Sequelize.TEXT('long') },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('FarmUpdateReviews');
  }
};
