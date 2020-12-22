const router = require('express').Router();
const passport = require('passport');




// auth with google
router.get('/twitter', passport.authenticate('twitter'))

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/')

  //control with passport
})
router.get('/twitter/redirect',passport.authenticate('twitter'), (req, res) => {
  res.redirect('/profile/')
}
)



module.exports = router;