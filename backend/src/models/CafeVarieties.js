'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CafeVariety extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CafeVariety.hasMany(models.CafeVarietyImage, {foreignKey: 'cafeVarietyId',as: 'images'});
      CafeVariety.belongsToMany(models.CafeType, {through: 'CafeVarietyCafeTypes', foreignKey: 'cafeVarietyId' ,otherKey: 'cafeTypeId', as: 'CafeTypes'})
      // define association here
    }
  };
  CafeVariety.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT('long'),
      descriptionMarkdown: DataTypes.TEXT('long'),
      descriptionHTML: DataTypes.TEXT('long'),
      image_file_id: DataTypes.STRING,
      image_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CafeVariety",
    }
  );

  return CafeVariety;
};
