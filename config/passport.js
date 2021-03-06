let passport = require("passport");
let LocalStrategy = require('passport-local').Strategy;

let User = require('../models/user');

passport.serializeUser(function (user, done) {
    done(null, user.id)
})

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    })
})

passport.use('local.registerUser',
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    },
        function (req, email, password, done) {
            User.findOne({ 'email': email }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    req.flash('error', 'User account exist, login instead');
                    return done(null, false)
                }

                let newUser = new User();
                newUser.email = req.body.email;
                newUser.fname = req.body.fname;
                newUser.sname = req.body.sname;
                newUser.dob = req.body.dob;
                newUser.gender = req.body.gender;
                newUser.password = newUser.generateHash(req.body.password);

                newUser.save(function (err) {
                    if (err) {
                        return done(err)
                    }

                    return done(null, newUser)
                })
            })
        })
);


passport.use('local.loginUser',
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    },
        function (req, email, password, done) {
            User.findOne({ 'email': email }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    req.flash('error', "User record not found!");
                    return done(null, false)
                }
                if (!user.validatePassword(password)) {
                    req.flash('error', 'Invalid user password!');
                    return done(null, false)
                }
                return done(null, user)
            })
        })
)
