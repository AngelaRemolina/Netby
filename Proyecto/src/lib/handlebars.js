const {format} = require('timeago.js');
const handlebars = require('handlebars')

const helpers = {};

helpers.timeago = (timestamp) =>{
    return format(timestamp);
};

handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

module.exports = helpers;