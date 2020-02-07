require('dotenv').config()
const models = require("../models");
const jwt = require ('jsonwebtoken');
const bcrypt = require ('bcryptjs');
const users = models.users


/* REGISTER USERS */
exports.register = (req,res) => {
    let storeEmail,storePassword;
    const {email, password, firstName, lastName} = req.body
    storeEmail = email.trim()
    storePassword = password.trim()

    if(firstName === undefined) {
        res.send({message: 'First Name is undefined'})
    }
    if(storeEmail === undefined) {
        res.send({message: 'name is undefined'})
    }
    if(storePassword === undefined) {
        res.send({message: 'name is undefined'})
    }

    firstName === "" ? res.send({message: 'first name is required'}) : firstName
    email === "" ? res.send({message: 'email is required'}) : email
    password === "" ? res.send({message: 'password is required'}) : password

    users.findAll({
        where: {
            email: storeEmail
        }
    }).then(resEmail => {
        if(resEmail.length > 0) {
            res.send({
                status: false,
                message: "Email has been registered"
            })
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                if(err) {
                    res.send({
                        status: false,
                        message: err
                    })
                } else {
                    bcrypt.hash(storePassword, salt, (err, hash) => {
                        if(err) {
                            res.send({
                                status: false,
                                message: err
                            })
                        } else {
                            users.create({
                                email: storeEmail,
                                password: hash,
                                firstName: firstName,
                                lastName: lastName
                            }).then(result => {
                                if(result) {
                                    const token = jwt.sign({id: result.id}, process.env.SECRET_KEY)
                                    res.status (200).json ({
                                        message: 'register user success',
                                        token: token,
                                    });
                                } else {
                                    res.send({
                                        status: false,
                                        message: 'register user failed'
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

/* LOGIN USERS */
/* ------------------- 
Login user
--> PARAMETER <---
email = string email
password = string
------------------------ */

exports.login = (req,res) => {
    let storeEmail,storePassword
    const {email, password} = req.body
    storeEmail = email.trim()
    storePassword = password.trim()

    email === "" ? res.send({message: 'email is required'}) : email
    password === "" ? res.send({message: 'password is required'}) : password

    users.findOne({
        where: {
            email: storeEmail
        }
    }).then(user => {
        if(user) {
            bcrypt.compare(storePassword, user.password, (err, isMatch) => {
                if(err) {
                    res.send({
                        status: false,
                        message: err
                    })
                } else if(!isMatch) {
                    res.send({
                        status: false,
                        message: "Password doesn't match"
                    })
                } else {
                    const token = jwt.sign ({id: user.id}, process.env.SECRET_KEY);
                    res.status (200).json ({
                        message: 'success',
                        email: user.email,
                        token: token,
                    });
                }
            })
        } else {
            res.send({
                status: false,
                message: 'email is not registered'
            })
        }
    })
}