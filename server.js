const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
//Configure paypal (link payment to your account and app)
//Change it with yours
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': '#',
    'client_secret': '#'
});

const app = express();

//ejs view
app.set('view engine', 'ejs');

//startup page
app.get('/', (req, res) => {
    res.render('index')
})
//successful payment route
app.get('/success', (req, res) => {
    //get payment execution parameters
    const payerId = req.query.PayerID
    const paymentId = req.query.paymentId

    //execute paymen var
    var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "2500.00"
            }
        }]
    };

    //excute payment operation
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.send('success')
        }
    });


})
//payment canceled
app.get('/cancel', (req, res) => {
    res.render('index')
})
//create payment 
app.post('/pay', (req, res) => {
    //payment json
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:5000/success",
            "cancel_url": "http://localhost:5000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Laptop",
                    "sku": "001",
                    "price": "2500",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "2500"
            },
            "description": "Hot new MacBook Laptop."
        }]
    };
    //initiate payment request
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            //link user to approval payment url
            for (let index = 0; index < payment.links.length; index++) {
                if (payment.links[index].rel === "approval_url") {
                    res.redirect(payment.links[index].href);
                }
            }
        }
    });

})


//listen on 5000 port
app.listen(5000, () => console.log("Server Started On 5000"));

