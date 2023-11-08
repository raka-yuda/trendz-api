const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define(
    "roles",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      timestamp: true,
      createdAt: false,
      updatedAt: false,
      tableName: "roles",
    }
  );

  return Role;
};
