'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CafeType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CafeType.belongsToMany(models.CafeVariety, {through: 'CafeVarietyCafeTypes', foreignKey: 'cafeTypeId' ,otherKey: 'cafeVarietyId', as: 'cafes'});
      // define association here
    }
  };
  CafeType.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CafeType",
    }
  );

  return CafeType;
};
