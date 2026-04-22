'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserFarm extends Model {
    static associate(models) {
      UserFarm.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      UserFarm.belongsTo(models.CafeVariety, { foreignKey: 'cafeVarietyId', as: 'cafeVariety' });
      UserFarm.hasMany(models.FarmWeeklyUpdate, { foreignKey: 'farmId', as: 'weeklyUpdates' });
    }
  }

  UserFarm.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      cafeVarietyId: { type: DataTypes.INTEGER, allowNull: false },
      farmName: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING },
      areaHa: { type: DataTypes.FLOAT }, // diện tích (ha)
      plantedAt: { type: DataTypes.DATE }, // ngày trồng (nếu có)
      note: { type: DataTypes.TEXT('long') },
    },
    { sequelize, modelName: 'UserFarm' }
  );

  return UserFarm;
};
