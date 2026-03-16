const User = require('./User');
const Board = require('./Board');
const List = require('./List');
const Card = require('./Card');

User.hasMany(Board, { foreignKey: 'userId', onDelete: 'CASCADE' });
Board.belongsTo(User, { foreignKey: 'userId' });

Board.hasMany(List, { foreignKey: 'boardId', onDelete: 'CASCADE' });
List.belongsTo(Board, { foreignKey: 'boardId' });

List.hasMany(Card, { foreignKey: 'listId', onDelete: 'CASCADE' });
Card.belongsTo(List, { foreignKey: 'listId' });

module.exports = { User, Board, List, Card };