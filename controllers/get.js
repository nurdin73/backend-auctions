const models = require('../models')
const {Auctions, UserAuctions, Orders} = require('../helpers/function')
const events = models.events
const auctions = models.auctions
const users = models.users
const userAuctions = models.userAuctions
const orders = models.orders
const news = models.news
const transactions = models.transactions
exports.events = (req,res) => {
    events.findAll().then(results => {
        if(results.length > 0) {
            res.status(200).json(results)
        } else {
            res.send({message: 'event not found'})
        }
    })
}


exports.auctionsByEvent = (req,res) => {
    auctions.findAll({
        where: {
            eventId: req.params.id
        },
        include: [
            {
                model: events,
                as: "event"
            },
            {
                model: users,
                as: "createdBy"
            }
        ]
    }).then(results => {
        if(results.length > 0) {
            res.status(200).json(Auctions(results))
        } else {
            res.send({message: 'no auctions in this event'})
        }
    })
}


exports.auctions = (req,res) => {
    auctions.findAll({
        include: [
            {
                model: events,
                as: "event"
            },
            {
                model: users,
                as: "createdBy"
            }
        ]
    }).then(results => {
        if(results.length > 0) {
            res.status(200).json(Auctions(results))
        } else {
            res.send({message: 'no auctions found'})
        }
    })
}

exports.getAuction = (req,res) => {
    userAuctions.findAll({
    }).then(results => {
        let id = []
        for (let i = 0; i < results.length; i++) {
            const element = results[i].userId;
            id.push(element)
        }
        res.send(id)
    })
}

exports.userAuctions = (req,res) => {
    userAuctions.findAll({
        where: {
            userId: req.user_id
        },
        include: [
            {
                model: auctions,
                as: "auction",
                include: [
                    {
                        model: events,
                        as: "event"
                    },
                    {
                        model: users,
                        as: "createdBy"
                    }
                ]
            },
            {
                model: users,
                as: "user"
            }
        ],
        order: [
            ['bidValue', 'DESC'],
        ],
    }).then(results => {
        if(results.length > 0) {
            res.status(200).json(UserAuctions(results))
        } else {
            res.send({message: 'no auctions order for this user'})
        }
    })
}

exports.orders = (req,res) => {
    orders.findAll({
        attributes:['id', 'userId', 'auctionId', 'transactionId'],
        where: {
            userId: req.user_id,
            statusTransaction: false
        },
        include: [
            {
                model: users,
                as: "user"
            }, 
            {
                model: auctions,
                as: "auction",
                include: [
                    {
                        model: events,
                        as: "event"
                    },
                    {
                        model: users,
                        as: "createdBy"
                    }
                ]
            },
            {
                model: transactions,
                as: "transaction"
            }
        ],
        
    }).then(results => {
        if(results.length > 0) {
            res.status(200).json(Orders(results))
        } else {
            res.send({message: "no orders in this user"})
        }
    })
}

exports.transactions = (req,res) => {
    transactions.findAll({
        where: {
            userId: req.user_id
        },
        attributes: ["id", "code"],
        include: [
            {
                model: users,
                as: "userTransaction",
                attributes: ["id", "email", "firstName", "lastName"]
            },
            {
                model: orders,
                as: "transaction"
            }
        ]
    }).then(results => {
        if(results.length > 0) {
            res.status(200).json(results)
        } else {
            res.send({message: "transaction not found"})
        }
    })
}


exports.news = (req,res) => {
    news.findAll().then(results => {
        if(results.length > 0) {
            res.status(200).json(results)
        } else {
            res.send({message: "news not found"})
        }
    })
}

exports.profile = (req,res) => {
    users.findOne({
        where: {
            id: req.user_id
        },
        attributes: ["id", "firstName", "lastName", "email"]
    }).then(result => {
        if(result) {
            res.status(200).json(result)
        } else {
            res.send({message: "user not found"})
        }
    })
}