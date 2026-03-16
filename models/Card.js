const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Card = sequelize.define('Card', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT, 
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  }
});

module.exports = Card;