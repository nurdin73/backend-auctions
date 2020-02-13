const models = require('../models')
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const {getCode, getTimeAdd, convertToRupiah, upload} = require('../helpers/function')
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
        // if(fixPrice <= startingPrice) {
        //     res.send({message: 'fix price cannot be lower from start price'})
        // } else {
        //     fixPrices = fixPrice
        // }
    }
    if(eventId === undefined || title === undefined || startingPrice === undefined || bidAccumulation === undefined || startTime === undefined || endTime === undefined || bidTimeAddition === undefined || fixPrice === undefined) {
        res.send({message: "this field has undefined"})
    }
    // if(startingPrice !== parseInt(startingPrice, 10) || bidAccumulation !== parseInt(bidAccumulation, 10) || fixPrices !== parseInt(fixPrices, 10)) {
    //     res.send({message: "field number is required"})
    // }
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
    users.findOne({
        where: {
            id: req.user_id
        }
    }).then(user => {
        if(user) {
            auctions.findOne({
                where: {
                    title: title
                }
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
                        userId: req.user_id,
                        status: false
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

exports.bid = (req, res) => {
    const {auctionId} = req.body
    if(auctionId === null || auctionId === "" || auctionId === undefined) {
        res.send({message: "auction ID is required", success: false})
    }
    auctions.findOne({
        where: {
            id: auctionId
        }
    }).then(dataAuction => {
        if(dataAuction) {
            if(dataAuction.status === false) {
                if(dataAuction.userId !== req.user_id) {
                    const date = new Date(dataAuction.startTime);
                    const startTime = date.getTime()
                    if(startTime < Date.now()) {
                        const date = new Date(dataAuction.endTime)
                        const endTime = date.getTime()
                        if(endTime > Date.now()) {
                            if(dataAuction.latestBidPrice !== dataAuction.fixPrice) {
                                userAuctions.findOne({
                                    where: {
                                        auctionId,
                                        userId: req.user_id,
                                        autoBidValueMax: {
                                            [Op.not] :0
                                        }
                                    }
                                }).then(check => {
                                    if(check) {
                                        res.send({message: "you has added auto bid. please wait of max value. try later", success: false})
                                    } else {
                                        userAuctions.create({
                                            userId: req.user_id,
                                            auctionId: auctionId,
                                            bidValue: dataAuction.bidAccumulation,
                                            autoBidValueMax: 0
                                        }).then(result => {
                                            if(!result) return res.send({message: "add bid failed. please try later", success: false})
                                            const addTime = getTimeAdd(dataAuction.bidTimeAddition)
                                            const endDate = endTime + addTime;
                                            const auctionTime = new Date(endDate)
                                            auctions.update(
                                                {
                                                    latestBidPrice: dataAuction.latestBidPrice + dataAuction.bidAccumulation,
                                                    endTime: auctionTime
                                                },
                                                {
                                                    where: {
                                                        id: auctionId
                                                    }
                                                }
                                            )
                                            res.send({message: "bid success..", success: true})
                                        })
                                    }
                                })
                            } else {
                                res.send({message: "sorry.... auction price has reached the limit. ", success: false})
                            }
                        } else {
                            res.send({message: "The auction is over", success: false})
                        }
                    } else {
                        res.send({message: "The auction hasn't started yet", success:false})
                    }
                } else {
                    res.send({message: "you can bid your auction!", success: false})
                }
            } else {
                res.send({message: "auction sold out!", success: false})
            }
        } else {
            res.send({message: "auction not found", success:false})
        }
    })
}


exports.auto = (req,res) => {
    const {auctionId, autoBidValueMax} = req.body
    if(auctionId === null || auctionId === "" || auctionId === undefined) {
        res.send({message: "auction ID is required", success: false})
    }
    if(autoBidValueMax < 0) {
        res.send({message:"auto bid cannot be 0 or lower", success: false})
    }
    auctions.findOne({
        where: {
            id: auctionId
        }
    }).then(dataAuction => {
        if(dataAuction) {
            if(dataAuction.status === false) {
                if(dataAuction.userId !== req.user_id) {
                    const date = new Date(dataAuction.startTime);
                    const startTime = date.getTime()
                    if(startTime < Date.now()) {
                        const date = new Date(dataAuction.endTime)
                        const endTime = date.getTime()
                        if(endTime > Date.now()) {
                            if(autoBidValueMax > dataAuction.bidAccumulation) {
                                if(dataAuction.latestBidPrice !== dataAuction.fixPrice) {
                                    userAuctions.findOne({
                                        where : {
                                            userId: req.user_id,
                                            auctionId: auctionId,
                                            autoBidValueMax: {
                                                [Op.not] :0
                                            }
                                        }
                                    }).then(userBid => {
                                        if(userBid) {
                                            if(userBid.autoBidValueMax <= userBid.bidValue) {
                                                if(userBid.autoBidValueMax <= autoBidValueMax) {
                                                    userAuctions.update(
                                                        {
                                                            bidValue: userBid.bidValue,
                                                            autoBidValueMax: autoBidValueMax
                                                        },
                                                        {
                                                            where: {
                                                                userId: req.user_id,
                                                                auctionId: auctionId,
                                                                autoBidValueMax: {
                                                                    [Op.not] :0
                                                                }
                                                            }
                                                        }
                                                    ).then(result => {
                                                        if(result) {
                                                            const addTime = getTimeAdd(dataAuction.bidTimeAddition)
                                                            const endDate = endTime + addTime;
                                                            const auctionTime = new Date(endDate)
                                                            auctions.update(
                                                                {
                                                                    latestBidPrice: dataAuction.latestBidPrice + dataAuction.bidAccumulation,
                                                                    endTime: auctionTime 
                                                                },
                                                                {
                                                                    where: {
                                                                        id: auctionId
                                                                    }
                                                                }
                                                            ).then(response => {
                                                                if(response) {
                                                                    res.send({message: "bid success. your auto bid has added. thanks", success: true})
                                                                } else {
                                                                    res.send({message: "auto bid failed", success: false})
                                                                }
                                                            })
                                                        } else {
                                                            res.send({message: "auto bid failed!", success: false})
                                                        }
                                                    })
                                                } else {
                                                    res.send({message: "your account has auto bid this auction of " + convertToRupiah(userBid.autoBidValueMax) +". if you want to add auto bid, please value mush be high from previous auto bid!", success: false})
                                                }
                                            } else {
                                                res.send({message: "sorry. your auto bid in this auction is remaining. try later", success: false})
                                            }
                                        } else {
                                            userAuctions.create({
                                                auctionId: auctionId,
                                                userId: req.user_id,
                                                bidValue: dataAuction.bidAccumulation,
                                                autoBidValueMax: autoBidValueMax
                                            }).then(result => {
                                                if(result) {
                                                    const addTime = getTimeAdd(dataAuction.bidTimeAddition)
                                                    const endDate = endTime + addTime;
                                                    const auctionTime = new Date(endDate)
                                                    auctions.update(
                                                        {
                                                            latestBidPrice: dataAuction.latestBidPrice + dataAuction.bidAccumulation,
                                                            endTime: auctionTime 
                                                        },
                                                        {
                                                            where: {
                                                                id: auctionId
                                                            }
                                                        }
                                                    ).then(response => {
                                                        if(response) {
                                                            res.send({message: "bid success. your auto bid has added. thanks", success: true})
                                                        } else {
                                                            res.send({message: "auto bid failed", success: false})
                                                        }
                                                    })
                                                } else {
                                                    res.send({message: "auto bid failed!", success: false})
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    res.send({message: "sorry.... auction price has reached the limit. ", success: false})
                                }
                            } else {
                                res.send({message: "auto bid mush be higher from bid accumulation", success: false})
                            }
                        } else {
                            res.send({message: "The auction is over", success: false})
                        }
                    } else {
                        res.send({message: "The auction hasn't started yet", success:false})
                    }
                } else {
                    res.send({message: "you can bid your auction!", success: false})
                }
            } else {
                res.send({message: "auction sold out!", success: false})
            }
        } else {
            res.send({message: "auction not found", success:false})
        }
    })

}


exports.autoBid = (req,res) => {
    const {auctionId} = req.body
    if(!auctionId) {
        res.send({message: "auction ID is required", success: false})
    }
    userAuctions.findAll({
        where: {
            auctionId,
            autoBidValueMax: {
                [Op.not] : 0
            }
        },
        attributes: ['id', 'auctionId', 'userId', 'bidValue', 'autoBidValueMax']
    })
    .then(results => {
        // console.log(JSON.stringify(results,null,4))
        if(results.length > 0) {
            auctions
            .findOne({ where:{ id: auctionId }})
            .then(result => {
                return result;
            })
            .then(response => {
                let success = ""
                if (!response) return res.send({ message: "auction not found", success: false });
                for (let i = 0; i < results.length; i++) {
                    if(results[i].autoBidValueMax > results[i].bidValue ) {
                        userAuctions.update(
                            {
                                bidValue: results[i].bidValue + response.bidAccumulation
                            },
                            {
                                where: {
                                    auctionId: results[i].auctionId,
                                    userId: results[i].userId,
                                    autoBidValueMax: {
                                        [Op.not] : 0
                                    }
                                }
                            }
                        )
                        success = "true"
                    }
                }
                if(success === "true") {
                    setTimeout(() => {
                        userAuctions.findAll({
                            attributes: [[Sequelize.fn('sum', Sequelize.col('bidValue')), 'total']],
                            raw: true,
                            where: {
                                auctionId: auctionId
                            }
                        }).then(price => {
                            let data = 0
                            for (let i = 0; i < price.length; i++) {
                                const element = price[i].total;
                                data = parseInt(element)
                            }
                            console.log(data, "===")
                            auctions.update(
                                {
                                    latestBidPrice: response.startingPrice + data,
                                },
                                {
                                    where: {
                                        id: auctionId
                                    }
                                }
                            ).then(data => {
                                if(data) {
                                    res.send({message: "success", success: true})
                                } else {
                                    message = "failed"
                                }
                            })
                        })
                    }, 3000);
                }
            })
        } else {
            res.send({message: "no user auto bid", success: false})
        }
    })
    .catch(err => {
        console.log(err)
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