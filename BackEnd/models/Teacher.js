const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Teacher = sequelize.define('Teacher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    coverPicUrl: {
        type: DataTypes.TEXT,
        field: 'cover_pic_url'
    },
    profession: {
        type: DataTypes.STRING,
        defaultValue: 'Teacher'
    },
    gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other', 'Prefer not to say'),
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT
    },
    location: {
        type: DataTypes.TEXT
    },
    websiteUrl: {
        type: DataTypes.TEXT,
        field: 'website_url'
    },
    interests: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: []
    },
    education: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    professionalSkills: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        field: 'professional_skills',
        defaultValue: []
    },
    certificates: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    followersCount: {
        type: DataTypes.INTEGER,
        field: 'followers_count',
        defaultValue: 0
    },
    followingCount: {
        type: DataTypes.INTEGER,
        field: 'following_count',
        defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'teachers',
    timestamps: true,
    underscored: true  // For snake_case columns
});

module.exports = Teacher;
module.exports.sequelize = sequelize;