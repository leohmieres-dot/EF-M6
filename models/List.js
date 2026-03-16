const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const List = sequelize.define('List', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = List;