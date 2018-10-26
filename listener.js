var WebSocket = require('ws'),
    Payment = require('./lib/payment');
var websocketUrl = 'wss://s1.ripple.com';
var rippleAddress = 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh';
var request = require('request');

function handlePayment(payment) {
  if (payment.toAddress == rippleAddress) {
    console.log('issued by this account');
    //if (payment.toCurrency == 'XRP') {
      if (payment.destinationTag) {
        var tag = payment.destinationTag;
        console.log("look up the bridge for destination tag", tag);
      }
    //}
  } else {
    //console.log('issued by some other account', payment.toAddress);
  }
}

function onOpen() {
  console.log('connection opened');
  this.send('{"command":"subscribe","id":0,"accounts":["'+rippleAddress+'"]}');
  console.log('listening for activity for account: '+ rippleAddress);
}

function onMessage(data, flags) {
  var response = JSON.parse(data);
  if (response.type == 'transaction') {
    try {
      var payment = new Payment(data);
      handlePayment(payment);
      console.log(payment.toJSON());
    } catch(e) {
      console.log(e);
    }
  }
}

function onClose() {
  console.log('connection closed');
  delete this;
  connectWebsocket(websocketUrl);
}

function connectWebsocket(url) {
  console.log('connecting to '+url);
  try {
    var ws = new WebSocket(url);
    ws.on('open', onOpen);
    ws.on('message', onMessage);
    ws.on('close', onClose);
  } catch(e) {
    console.log('error connecting', e);
    console.log('trying again...');
    connectWebsocket(url);
  }
}

connectWebsocket(websocketUrl);
