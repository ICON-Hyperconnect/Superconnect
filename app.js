const express = require('express');
const authRoutes = require('./routes/auth-routes');
const passport = require('passport');
const session = require('express-session');
const passportSetup = require('./config/passport-setup');
const keys = require('./config/keys');
const mongoose = require('mongoose');
const profileRoutes = require('./routes/profile-routes.js')
const statsRoutes=require('./routes/stats-routes.js')
const app = express();
app.set('view engine', 'ejs')

app.use(session({
  secret: keys.session.secret,
  proxy: true,
  resave: true, 
  saveUninitialized: true
}))
app.use(express.urlencoded({ 
  extended: false
}))

// initialize passport 
app.use(passport.initialize())
app.use(passport.session())
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/stats', statsRoutes);


mongoose.connect(keys.mongodb.dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('mongo connected')
  }
});

app.get('/', (req, res) => { 
  res.render('home', {user:req.user})
})



app.listen(5000, () => { 
  console.log("listening on http://localhost:5000")
})

