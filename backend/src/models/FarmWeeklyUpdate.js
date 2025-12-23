'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FarmWeeklyUpdate extends Model {
    static associate(models) {
      FarmWeeklyUpdate.belongsTo(models.UserFarm, { foreignKey: 'farmId', as: 'farm' });
      FarmWeeklyUpdate.belongsTo(models.GrowthStage, { foreignKey: 'growthStageId', as: 'growthStage' });
      FarmWeeklyUpdate.hasOne(models.FarmUpdateReview, { foreignKey: 'updateId', as: 'review' });
    }
  }

  FarmWeeklyUpdate.init(
    {
      farmId: { type: DataTypes.INTEGER, allowNull: false },
      weekStart: { type: DataTypes.DATEONLY, allowNull: false }, // ngày đầu tuần (Thứ 2)
      growthStageId: { type: DataTypes.INTEGER }, // giai đoạn sinh trưởng
      healthStatus: { type: DataTypes.ENUM('tot', 'trung_binh', 'kem'), defaultValue: 'tot' },
      noteMarkdown: { type: DataTypes.TEXT('long') },
      noteHTML: { type: DataTypes.TEXT('long') },
      image_url: { type: DataTypes.STRING },
      image_file_id: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: 'FarmWeeklyUpdate',
      indexes: [
        { unique: true, fields: ['farmId', 'weekStart'] },
      ],
    }
  );

  return FarmWeeklyUpdate;
};
