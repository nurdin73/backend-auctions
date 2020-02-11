const models = require('../models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const {getCode, getTimeAdd} = require('../helpers/function')
const events = models.events
const auctions = models.auctions
const users = models.users
const userAuctions = models.userAuctions
const orders = models.orders
const transactions = models.transactions
exports.auction = (req,res) => {
    let fixPrices;
    const {eventId, title, startingPrice, bidAccumulation, fixPrice, startTime, endTime, bidTimeAddition} = req.body
    if(fixPrice === null || fixPrice === "") {
        fixPrices = 0
    } else {
        if(fixPrice <= startingPrice) {
            res.send({message: 'fix price cannot be lower from start price'})
        } else {
            fixPrices = fixPrice
        }
    }
    if(eventId === undefined || title === undefined || startingPrice === undefined || bidAccumulation === undefined || startTime === undefined || endTime === undefined || bidTimeAddition === undefined || fixPrice === undefined) {
        res.send({message: "this field has undefined"})
    }
    if(startingPrice !== parseInt(startingPrice, 10) || bidAccumulation !== parseInt(bidAccumulation, 10) || fixPrices !== parseInt(fixPrices, 10)) {
        res.send({message: "field number is required"})
    }
    eventId === null || eventId === "" ? res.send({message: 'please choose one event'}) : eventId
    title === null || title === "" ? res.send({message: 'title is required'}) : title
    startingPrice === null || startingPrice === "" ? res.send({message: 'start price is required'}) : startingPrice
    bidAccumulation === null || bidAccumulation === "" ? res.send({message: 'bid accumulation is required'}) : bidAccumulation
    
    startTime === null || startTime === "" ? res.send({message: 'start time is required'}) : startTime
    endTime === null || endTime === "" ? res.send({message: 'end time is required'}) : endTime
    bidTimeAddition === null || bidTimeAddition === "" ? res.send({message: 'bid time accumulation is required'}) : bidTimeAddition
    if(startingPrice <= 0 || bidAccumulation <= 0) {
        res.send({message: "field cannot be 0 or lower"})
    }
    if(bidAccumulation >= startingPrice) {
        res.send({message: 'Bid accumulation cannot be higher from start price'})
    }
    users.finOne({
        where: {
            id: req.user_id
        }
    }).then(user => {
        if(user) {
            auctions.findOne({
                title: title
            }).then(auction => {
                if(!auction) {
                    auctions.create({
                        eventId: eventId,
                        title: title,
                        startingPrice: startingPrice,
                        bidAccumulation: bidAccumulation,
                        latestBidPrice: startingPrice,
                        fixPrice: fixPrices,
                        image: req.file.filename,
                        startTime: startTime,
                        endTime: endTime,
                        bidTimeAddition: bidTimeAddition,
                        userId: req.user_id
                    }).then(result => {
                        if(result) {
                            res.send({message: "add auction success"})
                        } else {
                            res.send({message: "add auction failed"})
                        }
                    })
                } else {
                    res.send({message: "title has been used"})
                }
            })
        } else {
            res.send({message: "user not registered"})
        }
    })
}

exports.userAuction = (req,res) => {
    let autoBid;
    const {auctionId, autoBidValueMax} = req.body
    auctionId === null || auctionId === "" ? res.send({message: "auction id is required", success: false}) : auctionId
    if(autoBidValueMax < 0) {
        res.send({message: "auto bid cannot be lower from 0", success: false})
    } else if(autoBidValueMax === 0 || autoBidValueMax === null) {
        autoBid = 0
    } else if (autoBidValueMax > 0) {
        autoBid = autoBidValueMax
    }
    auctions.findOne({
        where: {
            id: auctionId
        }
    }).then(auction => {
        if(auction) {
            if(auction.status === false) {
                if(auction.userId !== req.user_id) {
                    if(auction.latestBidPrice !== auction.fixPrice) {
                        const date = new Date(auction.endTime)
                        const time = date.getTime()
                        if(time > Date.now()) {
                            userAuctions.findOne({
                                where: {
                                    userId: req.user_id,
                                    auctionId: auctionId
                                }
                            }).then(user => {
                                if(user) {
                                    // let bidMax;
                                    // if((user.bidValue + auction.bidAccumulation) > user.autoBidValueMax) {
                                    //     bidMax = user.autoBidValueMax
                                    // } else {
                                    //     bidMax = user.bidValue + auction.bidAccumulation
                                    // }
                                    userAuctions.update(
                                        {
                                            bidValue: user.bidValue + auction.bidAccumulation,
                                            autoBidValueMax: user.autoBidValueMax
                                        },
                                        {
                                            where: {
                                                userId: req.user_id,
                                                auctionId: auctionId
                                            }
                                        }
                                    ).then(result => {
                                        if(result) {
                                            const addTime = getTimeAdd(auction.bidTimeAddition)
                                            const endTime = time + addTime;
                                            const auctionTime = new Date(endTime)
                                                
                                            userAuctions.findAll({
                                                order: [["bidValue", "DESC"]]
                                            }).then(data => {
                                                userAuctions.findOne({
                                                    where: {
                                                        userId: req.user_id,
                                                        auctionId: auctionId
                                                    }
                                                }).then(data2 => {
                                                    if(data2.bidValue < data[0].bidValue) {
                                                        auctions.update(
                                                            {
                                                                latestBidPrice: auction.startingPrice + data[0].bidValue,
                                                                endTime: auctionTime
                                                            },
                                                            {
                                                                where: {
                                                                    id: auctionId
                                                                }
                                                            }
                                                        ).then(response => {
                                                            if(response) {
                                                                res.send({message: "bid auction success. but your bid is smaller", success: true})
                                                            } else {
                                                                res.send({message: "bid auction failed", success: false})
                                                            }
                                                        })
                                                    } else {
                                                        auctions.update(
                                                            {
                                                                latestBidPrice: auction.startingPrice + data[0].bidValue,
                                                                endTime: auctionTime
                                                            },
                                                            {
                                                                where: {
                                                                    id: auctionId
                                                                }
                                                            }
                                                        ).then(response => {
                                                            if(response) {
                                                                res.send({message: "bid auction success. your bid leads temporarily", success: true})
                                                            } else {
                                                                res.send({message: "bid auction failed", success: false})
                                                            }
                                                        })
                                                    }
                                                })
                                            })
                                        } else {
                                            res.send({message: "bid auction failed", success: false})
                                        }
                                    })
                                } else {
                                    userAuctions.create({
                                        auctionId: auctionId,
                                        userId: req.user_id,
                                        bidValue: auction.bidAccumulation,
                                        autoBidValueMax: autoBid
                                    }).then(result => {
                                        if(result) {
                                            const addTime = getTimeAdd(auction.bidTimeAddition)
                                            const endTime = time + addTime;
                                            const auctionTime = new Date(endTime)
                                            userAuctions.findAll({
                                                order: [["bidValue", "DESC"]]
                                            }).then(data => {
                                                auctions.update(
                                                    {
                                                        latestBidPrice: auction.startingPrice + data[0].bidValue,
                                                        endTime: auctionTime
                                                    },
                                                    {
                                                        where: {
                                                            id: auctionId
                                                        }
                                                    }
                                                ).then(response => {
                                                    if(response) {
                                                        res.send({message: "bid auction success.", success: true})
                                                    } else {
                                                        res.send({message: "bid auction failed", success: false})
                                                    }
                                                })
                                            })
                                        } else {
                                            res.send({message: "bid auction failed", success: false})
                                        }
                                    })
                                }
                            })
                        } else {
                            res.send({message: "auction is over", success: false})
                        }
                    } else {
                        res.send({message: "sorry.... auction price has reached the limit. ", success: false})
                    }
                } else {
                    res.send({message: "you cant auction your item", success: false})
                }
            } else {
                res.send({message: "auction sold out", success: false})
            }
        } else {
            res.send({message: "auction not found", success: false})
        }
    })
}


exports.order = (req,res) => {
    const {auctionId, userId} = req.body
    auctions.findOne({
        where: {
            id: auctionId
        }
    }).then(auction => {
        if(auction) {
            if(auction.userId === req.user_id) {
                if(userId !== auction.userId) {
                    if(auction.status === false) {
                        const date = new Date(auction.endTime)
                        const time = date.getTime()
                        if(Date.now() > time || auction.latestBidPrice === auction.fixPrice) {
                            orders.findOne({
                                where: {
                                    userId: userId,
                                    auctionId: auctionId
                                }
                            }).then(response => {
                                if(!response) {
                                    orders.create({
                                        userId: userId,
                                        auctionId: auctionId,
                                        transactions: null,
                                        statusTransaction: false 
                                    }).then(order => {
                                        if(order) {
                                            auctions.update(
                                                {
                                                    status: true
                                                },
                                                {
                                                    where: {
                                                        id: auction.id
                                                    }
                                                }
                                            ).then(result => {
                                                if(result) {
                                                    res.send({message: `order auction ID : ${auctionId} success`})
                                                } else {
                                                    res.send({message: "order failed"})
                                                }
                                            })
                                        } else {
                                            res.send({message: "order failed"})
                                        }
                                    })
                                } else {
                                    res.send({message: "you have already ordered this item"})
                                }
                            })
                        } else {
                            res.send({
                                expiredTime : time - Date.now() + " Latest Price : " + auction.latestBidPrice,
                                message: "i am sorry time and latest bid has still under provision. try it later"
                            })
                        }
                        
                    } else {
                        res.send({message: "auction sold out"})
                    }
                } else {
                    res.send({message: "you cant order your item"})
                }
            } else {
                res.send({message: "you are not authorized to execute this order"})
            }
        } else {
            res.send({message: "auction not found"})
        }
    })
}

exports.transaction = (req,res) => {
    const {auctionId} = req.body
    if(auctionId.length > 0) {
        orders.findAll({
            where: {
                userId: req.user_id,
                auctionId: auctionId,
                statusTransaction: false 
            }
        }).then(results => {
            if(results.length > 0) {
                transactions.create({
                    code: getCode(),
                    userId: req.user_id,
                    expiredTime: Date.now() + (1000 * 60 * 60 * 24)
                }).then(result => {
                    if(result) {
                        orders.update(
                            {
                                transactionId: result.id,
                                statusTransaction: true
                            },
                            {
                                where: {
                                    userId: req.user_id,
                                    auctionId: auctionId
                                }
                            }
                        ).then(order => {
                            if(order) {
                                res.send({message: "success"})
                            } else {
                                res.send({message: "failed"})
                            }
                        })
                    } else {
                        res.send({message: "create transaction failed"})
                    }
                })
            } else {
                res.send({message: "create transaction failed!"})
            }
        })
    } else {
        res.send({message: "auction id is required"})
    }
}