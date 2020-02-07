'use strict';
module.exports = (sequelize, DataTypes) => {
  const userAuctions = sequelize.define('userAuctions', {
    auctionId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    bidValue: DataTypes.INTEGER,
    autoBidValueMax: DataTypes.INTEGER
  }, {});
  userAuctions.associate = function(models) {
    // associations can be defined here
    userAuctions.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user",
      sourceKey: "id"
    })
    userAuctions.belongsTo(models.auctions, {
      foreignKey: "auctionId",
      as: "auction",
      sourceKey: "id"
    })
  };
  return userAuctions;
};