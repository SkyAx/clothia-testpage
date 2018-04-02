const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const JsonDB = require('node-json-db');

let db = new JsonDB("db", true, false);
let app = express();
db.push('/basketProducts', []);

app.listen(3002);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log('%s %s', req.method, req.url);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/getBasketCount', (req, res) => {
    let basketProducts = (db.getData('/basketProducts'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count: basketProducts.length}));
});

app.get('/getBasket', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.getData('/basketProducts')));
});

app.post('/addToBasket', (req, res) => {
    if(!(db.getData('/basketProducts').find(obj => obj.productId === req.body.productId))){
        db.push('/basketProducts[]', req.body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({state:"success", basketProducts: db.getData('/basketProducts')}));
    } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({state:"error",error:"product contains"}));
    }
});

app.post('/deleteFromBasket', (req, res) => {
    let product = db.getData('/basketProducts').find(obj => obj.productId === req.body.productId);
    let idx = db.getData('/basketProducts').indexOf(product);

    if (product) {
        db.delete(`/basketProducts[${idx}]`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({state:"success", basketProducts: db.getData('/basketProducts')}));
    } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({state:"error",error:"product not found"}));
    }
});

app.post('/increaseCountToProduct', (req, res) => {
    let product = db.getData('/basketProducts').find(obj => obj.productId === req.body.productId);
    let idx = db.getData('/basketProducts').indexOf(product);
    let currentCount = db.getData(`/basketProducts[${idx}]/productCount`);

    if (product) {
        db.push(`/basketProducts[${idx}]/productCount`, +currentCount + 1);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({state:"success", currentProductCount: db.getData(`/basketProducts[${idx}]/productCount`)  }));
    } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({state:"error",error:"can't increase count of product"}));
    }
});

app.post('/decreaseCountToProduct', (req, res) => {
    let product = db.getData('/basketProducts').find(obj => obj.productId === req.body.productId);
    let idx = db.getData('/basketProducts').indexOf(product);
    let currentCount = db.getData(`/basketProducts[${idx}]/productCount`);

    if (product) {
        db.push(`/basketProducts[${idx}]/productCount`, +currentCount - 1);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({state:"success", currentProductCount: db.getData(`/basketProducts[${idx}]/productCount`)  }));
    } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({state:"error",error:"can't decrease count of product"}));
    }
});
