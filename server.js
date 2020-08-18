const express = require('express');
const ejs = require('ejs');
var Moyasar = require('moyasar');
const bodyParser = require("body-parser");
const { parse } = require('querystring');

//Configure paypal (link payment to your account and app)
//change with your cradentials
const paytabs = require('paytabs_api');
const paytabsEmail = "##";
const paytabsSecretKey = "##";

const app = express();
app.use(bodyParser.json());

//set a quick front-end using ejs
app.set('view engine', 'ejs');

//Helper method to get data from post request
function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if (request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}


//ROUTES-----

//startup page
app.get('/', (req, res) => {
    res.render('index')
})

//create payment 
app.post('/pay', (req, res) => {
    paytabs.createPayPage({
        'merchant_email': paytabsEmail,
        'secret_key': paytabsSecretKey,
        'currency': 'SAR',//change this to the required currency
        'amount': '10',//change this to the required amount
        'site_url': 'http://localhost:5000',//change this to reflect your site
        'title': 'Renting a Car',//Change this to reflect your order title
        'quantity': 1,//Quantity of the product
        'unit_price': 10, //Quantity * price must be equal to amount
        'products_per_title': 'Shoes | Jeans', //Change this to your products
        'return_url': 'http://localhost:5000/success',//This should be your callback url
        'cc_first_name': 'Samy',//Customer First Name
        'cc_last_name': 'Saad',//Customer Last Name
        'cc_phone_number': '00973', //Country code
        'phone_number': '12332323', //Customer Phone
        'billing_address': 'Address', //Billing Address
        'city': 'Manama',//Billing City
        'state': 'Manama',//Billing State
        'postal_code': '1234',//Postal Code
        'country': 'SAU',//Iso 3 country code
        'email': '<CUSTOMER EMAIL>',//Customer Email
        'ip_customer': '<CUSTOMER IP>',//Pass customer IP here
        'ip_merchant': '<MERCHANT IP>',//Change this to your server IP
        'address_shipping': 'Shipping',//Shipping Address
        'city_shipping': 'Manama',//Shipping City
        'state_shipping': 'Manama',//Shipping State
        'postal_code_shipping': '973',
        'country_shipping': 'BHR',
        'other_charges': 0,//Other chargs can be here
        'reference_no': 1234,//Pass the order id on your system for your reference
        'msg_lang': 'en',//The language for the response
        'cms_with_version': 'Nodejs Lib v1'//Feel free to change this
    }, createPayPage);
    function createPayPage(result) {
        if (result.response_code == 4012) {
            //Redirect your merchant to the payment link
            console.log(result);
            res.redirect(result.payment_url);
        } else {
            //Handle the error
            console.log(result);
        }
    }
})

//successful payment route
app.post('/success', (req, res) => {
    if (req.method === 'POST') {
        collectRequestData(req, result => {
            if (result && result.payment_reference) {
                // get payment information
                //successful payment
                paytabs.verifyPayment({
                    'merchant_email': paytabsEmail,
                    'secret_key': paytabsSecretKey,
                    'payment_reference': result.payment_reference
                }, verifyPayment);
                function verifyPayment(result) {
                    res.send(result)
                }
            } else {
                //failed payment
                res.send(result)
            }
        });
    } else {
        //something went wrong with the return of payment
        res.render('index');
    }
})

//listen on 5000 port
app.listen(5000, () => console.log("Server Started On 5000"));

