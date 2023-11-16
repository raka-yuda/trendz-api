'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('topics_scrape_request', 'tweets_limit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'tweets_limit'
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('topics_scrape_request', 'tweets_limit');
  },
};
