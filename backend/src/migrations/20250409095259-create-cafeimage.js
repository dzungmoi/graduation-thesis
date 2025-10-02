'use strict';

const { Sequelize } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CafeVarietyImages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      riceVarietyId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'CafeVarieties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',  
      },
      image_url: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT('long')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
      
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CafeVarietyImages');
  }
};

