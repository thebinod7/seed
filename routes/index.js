const express = require('express');
const router = express.Router();
const TestService = require('../services/test');


router.get('/', (req,res,next) => {
  res.render('index',{ title : 'Seed || Home', data : 'Home page'});
});

router.post('/test', (req,res,next) => {
  TestService.save(req.body)
  .then(d => {
    res.json(d)
  })
  .catch(next)
})

module.exports = router;
