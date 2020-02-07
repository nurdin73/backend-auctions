'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('auctions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eventId: {
        type: Sequelize.INTEGER,
        references: {
          model: "events",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "set null"
      },
      title: {
        type: Sequelize.STRING
      },
      startingPrice: {
        type: Sequelize.INTEGER
      },
      bidAccumulation: {
        type: Sequelize.INTEGER
      },
      latestBidPrice: {
        type: Sequelize.INTEGER
      },
      fixPrice: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.STRING
      },
      startTime: {
        type: Sequelize.DATE
      },
      endTime: {
        type: Sequelize.DATE
      },
      bidTimeAddition: {
        type: Sequelize.TIME
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('auctions');
  }
};