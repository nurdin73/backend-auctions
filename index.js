require("express-group-routes");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require('path')
const port = 5000;
app.use(express.json())
app.use(cors())
app.use('/images', express.static(path.join(__dirname + "/images")));

const {authenticated, upload} = require('./middleware')

const getControllers = require('./controllers/get')
const authControllers = require('./controllers/auth')
const postControllers = require('./controllers/post')

app.get('/', (req,res) => {
    res.send('Welcome to my API')
})

app.group('/api/v1', router => {
    router.get('/events', getControllers.events)
    router.get('/event/:id/auctions', getControllers.auctionsByEvent)
    router.get('/auctions', getControllers.auctions)
    router.get('/user-auctions', authenticated, getControllers.userAuctions)
    router.get('/orders', authenticated, getControllers.orders)
    router.get('/transactions', authenticated, getControllers.transactions)
    router.get('/news', getControllers.news)

    router.post('/auction', authenticated, upload.single('images'), postControllers.auction)
    router.post('/user-auction', authenticated, postControllers.userAuction)
    router.post('/order', authenticated, postControllers.order)
    router.post('/transaction', authenticated, postControllers.transaction)

    router.post('/register', authControllers.register)
    router.post('/login', authControllers.login)
})

app.listen(port, console.log(`Listen to port ${port}`));