'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('topics_scrape_request', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('topics_scrape_request', 'metadata');
  },
};
