'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CafeVarietyImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CafeVarietyImage.belongsTo(models.CafeVariety, {foreignKey: 'cafeVarietyId', as: 'cafe'})
      // define association here
    }
  };
  CafeVarietyImage.init(
    {
      cafeVarietyId: DataTypes.INTEGER,
      image_url: DataTypes.STRING,
      description: DataTypes.TEXT('long'),
    },
    {
      sequelize,
      modelName: "CafeVarietyImage",
    }
  );

  return CafeVarietyImage;
};
