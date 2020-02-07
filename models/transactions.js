'use strict';
module.exports = (sequelize, DataTypes) => {
  const transactions = sequelize.define('transactions', {
    code: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    expiredTime: DataTypes.BIGINT,
  }, {});
  transactions.associate = function(models) {
    // associations can be defined here
    transactions.hasMany(models.orders, {
      foreignKey: "transactionId",
      as: "transaction"
    })
    transactions.belongsTo(models.users, {
      foreignKey: "userId",
      as: "userTransaction"
    })
  };
  return transactions;
};