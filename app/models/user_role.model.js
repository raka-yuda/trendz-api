const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = require("../models/user.model")(sequelize);
  const Role = require("../models/role.model")(sequelize);

  const UserRole = sequelize.define(
    "user_roles",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        field: 'role_id',
        references: {
          model: User,
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        references: {
          model: Role,
          key: "id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamp: true,
      createdAt: false,
      updatedAt: false,
      tableName: "user_roles",
    }
  );

  return UserRole;
};
