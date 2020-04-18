const Sequelize = require('sequelize');
const connection = require('../connection');

const Duette = connection.define('duette', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  // TODO: add 'createdBy' or similar
})

module.exports = Duette;