'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING
  }, {});
  users.associate = function(models) {
    // associations can be defined here
    users.hasMany(models.auctions, {
      foreignKey: "userId",
      as: "createdBy"
    })
    users.hasMany(models.userAuctions, {
      foreignKey: "userId",
      as: "user"
    })
    users.hasMany(models.transactions, {
      foreignKey: "userId",
      as: "userTransaction",
      sourceKey: "id"
    })
    users.belongsToMany(models.auctions, {
      through: models.orders,
      as: "auctions",
      foreignKey: "auctionId"
    })
    // users.hasMany(models.userAuctions, {
    //   foreignKey: "userId",
    //   as: "userAuction"
    // })
    // users.belongsToMany(models.auctions, {
    //   through: models.userAuctions,
    //   as: "userAuctions",
    //   foreignKey: "auctionId"
    // })
  };
  return users;
};