var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    qrcode = require('qrcode-npm'),
    decode = require('salesforce-signed-request'),

    consumerSecret = process.env.CONSUMER_SECRET,

    app = express();

app.set('view engine', 'ejs');
app.use(bodyParser()); // pull information from html in POST
app.use(express.static(__dirname + '/public'));

app.post('/signedrequest', function(req, res) {

    // You could save this information in the user session if needed
    var signedRequest = decode(req.body.signed_request, consumerSecret),
        context = signedRequest.context,
        oauthToken = signedRequest.client.oauthToken,
        instanceUrl = signedRequest.client.instanceUrl,

        query = "SELECT Id FROM Opportunity WHERE Id = '" + context.environment.record.Id + "'",

        contactRequest = {
            url: instanceUrl + '/services/data/v29.0/query?q=' + query,
            headers: {
                'Authorization': 'OAuth ' + oauthToken
            }
        };

    request(contactRequest, function(err, response, body) {
        console.log('>> ', body);
        res.render('index', { context: {user: {id: 'test' }}});
    });

});

app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});