'use strict';
module.exports = (sequelize, DataTypes) => {
  const events = sequelize.define('events', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE
  }, {});
  events.associate = function(models) {
    // associations can be defined here
    events.hasMany(models.auctions, {
      foreignKey: "eventId",
      as: "event"
    })
  };
  return events;
};