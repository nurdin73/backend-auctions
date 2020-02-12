exports.Auctions = data => {
    const newAuctions = data.map(data => {
        let auction = {
            id: data.id,
            event: {
                id: data.event.id,
                title: data.event.title,
            },
            title: data.title,
            startingPrice: data.startingPrice,
            bidAccumulation: data.bidAccumulation,
            latestBidPrice: data.latestBidPrice,
            fixPrice: data.fixPrice,
            image: data.image,
            startTime: data.startTime,
            endTime: data.endTime,
            bidTimeAddition: data.bidTimeAddition,
            createdBy: {
                id: data.createdBy.id,
                email: data.createdBy.email,
            }
        }
        return auction
    })
    return newAuctions
}

exports.UserAuctions = data => {
    const newUserAuctions = data.map(res => {
        let userAuction = {
            id: res.id,
            auction: {
                id: res.auction.id,
                event: {
                    id: res.auction.event.id,
                    title: res.auction.event.title,
                },
                title: res.auction.title,
                startingPrice: res.auction.startingPrice,
                bidAccumulation: res.auction.bidAccumulation,
                latestBidPrice: res.auction.latestBidPrice,
                fixPrice: res.auction.fixPrice,
                image: res.auction.image,
                startTime: res.auction.startTime,
                endTime: res.auction.endTime,
                bidTimeAddition: res.auction.bidTimeAddition,
                createdBy: {
                    id: res.auction.createdBy.id,
                    email: res.auction.createdBy.email,
                }
            },
            user: {
                id: res.user.id,
                email: res.user.email,
            },
            bidValue: res.bidValue,
            autoBidValueMax: res.autoBidValueMax
        }
        return userAuction
    })
    return newUserAuctions
}

exports.Orders = data => {
    const newOrders = data.map(res => {
        let Orders = {
            id: res.id,
            user: {
               id : res.user.id,
               email : res.user.email
            },
            auction: {
                id: res.auction.id,
                event: {
                    id: res.auction.event.id,
                    title: res.auction.event.title,
                },
                title: res.auction.title,
                startingPrice: res.auction.startingPrice,
                bidAccumulation: res.auction.bidAccumulation,
                latestBidPrice: res.auction.latestBidPrice,
                fixPrice: res.auction.fixPrice,
                image: res.auction.image,
                startTime: res.auction.startTime,
                endTime: res.auction.endTime,
                bidTimeAddition: res.auction.bidTimeAddition,
                createdBy: {
                    id: res.auction.createdBy.id,
                    email: res.auction.createdBy.email,
                }
            },
            transaction: {
                id: res.transaction.id,
                code: res.transaction.code,
            }
        }
        return Orders
    })
    return newOrders
}

exports.getCode = () => {
    let result      = ''
    let characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let charactersLength = characters.length
    for (let i = 0; i < 20; i++) {
        result +=  characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

exports.getTimeAdd = (time) => {
    const timeParts = time.split(":");
    return (timeParts[0] * (60 * 60 * 1000)) + (timeParts[1] * (60 * 1000)) + (timeParts[2] * (1000))
}

exports.convertToRupiah = (angka) => {
    var rupiah = '';		
    var angkarev = angka.toString().split('').reverse().join('');
    for(var i = 0; i < angkarev.length; i++) if(i%3 === 0) rupiah += angkarev.substr(i,3)+'.';
    return 'Rp. '+rupiah.split('',rupiah.length-1).reverse().join('');
}