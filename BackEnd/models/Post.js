const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust path if your DB config is elsewhere
const User = require('./User'); // Assuming posts belong to users

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  replies: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Add image handling via a separate Attachment model if needed (see schema)
}, {
  timestamps: true,
  tableName: 'posts',
});

Post.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Post, { foreignKey: 'userId' });

module.exports = Post;