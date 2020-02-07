'use strict';
module.exports = (sequelize, DataTypes) => {
  const orders = sequelize.define('orders', {
    userId: DataTypes.INTEGER,
    auctionId: DataTypes.INTEGER,
    transactionId: DataTypes.INTEGER,
    statusTransaction: DataTypes.BOOLEAN
  }, {});
  
  orders.associate = function(models) {
    // associations can be defined here
    orders.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user",
      sourceKey: "id"
    })
    orders.belongsTo(models.auctions, {
      foreignKey: "auctionId",
      as: "auction",
      sourceKey: "id"
    })
    orders.belongsTo(models.transactions, {
      foreignKey: "transactionId",
      as: "transaction",
      sourceKey: "id"
    })
  };
  return orders;
};