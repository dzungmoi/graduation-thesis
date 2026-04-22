'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FarmUpdateReview extends Model {
    static associate(models) {
      FarmUpdateReview.belongsTo(models.FarmWeeklyUpdate, { foreignKey: 'updateId', as: 'update' });
      FarmUpdateReview.belongsTo(models.User, { foreignKey: 'adminId', as: 'admin' });
    }
  }

  FarmUpdateReview.init(
    {
      updateId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      adminId: { type: DataTypes.INTEGER, allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
      comment: { type: DataTypes.TEXT('long') },
    },
    { sequelize, modelName: 'FarmUpdateReview' }
  );

  return FarmUpdateReview;
};
