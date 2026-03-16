const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Board = sequelize.define('Board', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Board;