const Test = require('../models/test');

const save = (payload) => {
  return new Promise((resolve, reject) => {
    let obj = new Test(payload);
    obj.save()
    .then( d => resolve(d))
    .catch( e => reject(e))
  });
}

module.exports = {
  save
}
