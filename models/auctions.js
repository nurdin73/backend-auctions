'use strict';
module.exports = (sequelize, DataTypes) => {
  const auctions = sequelize.define('auctions', {
    eventId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    startingPrice: DataTypes.INTEGER,
    bidAccumulation: DataTypes.INTEGER,
    latestBidPrice: DataTypes.INTEGER,
    fixPrice: DataTypes.INTEGER,
    image: DataTypes.STRING,
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    bidTimeAddition: DataTypes.TIME,
    userId: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN
  }, {});
  auctions.associate = function(models) {
    // associations can be defined here
    auctions.belongsTo(models.events, {
      foreignKey: "eventId",
      as: "event",
      sourceKey: "id"
    })
    auctions.belongsTo(models.users, {
      foreignKey: "userId",
      as: "createdBy",
      sourceKey: "id"
    })
    auctions.hasMany(models.userAuctions, {
      foreignKey: "userId",
      as: "auction"
    })
    auctions.belongsToMany(models.users, {
      through: models.orders,
      as: "userOrders",
      foreignKey: "userId"
    })
  };
  return auctions;
};