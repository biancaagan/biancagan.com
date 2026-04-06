// const mqtt = require("mqtt"); // skip in browser

let topic = 'blt';
let rxClient;

// Divs to show messages:
let brokerDiv, statusDiv, moisture1Div, moisture2Div;
// Whether the rxClient should be publishing or not:
let publishing = true;

function setup() {
    // Put the divs in variables for ease of use:
    brokerDiv = document.getElementById('brokerDiv');
    statusDiv = document.getElementById('statusDiv');
    moisture1Div = document.getElementById('moisture1Div');
    moisture2Div = document.getElementById('moisture2Div');

    // Set text of brokerDiv:
    brokerDiv.innerHTML = 'Trying to connect...';

    // Attempt to connect:
    rxClient = mqtt.connect("wss://blt-garden-v1:eBikWJ95547eTzBs@blt-garden-v1.cloud.shiftr.io", {
        clientId: "blt-rx" + Math.floor(Math.random() * 100) + 1
    });

    // Set listeners:
    rxClient.on('connect', onConnect);
    rxClient.on('close', onDisconnect);
    rxClient.on('message', onMessage);
    rxClient.on('error', onError);

}


// Handler for MQTT connect event:
function onConnect() {
    // Update brokerDiv text:
    brokerDiv.innerHTML = 'Connected to broker.';
    rxClient.subscribe(topic);
    // Can subscribe to multiple topics
}


// Handler for MQTT disconnect event:
function onDisconnect() {
    // Update brokerDiv text:
    brokerDiv.innerHTML = 'Disconnected from broker.';
}


// Handler for MQTT error event:
function onError(error) {
    // Update brokerDiv text:
    brokerDiv.innerHTML = error;
}


// Handler for MQTT subscribe event:
function onSubscribe(response, error) {
    if (!error) {
        // Update brokerDiv text:
        brokerDiv.innerHTML = 'Subscribed to broker.';
    } else {
        // Update brokerDiv text with the error:
        brokerDiv.innerHTML = error;
    }
}


// Handler for MQTT message received event:
function onMessage(topic, message) {
    // Message is a buffer, convert to a string:
    const msgString = message.toString();
    const data = JSON.parse(msgString);

    // console.log(topic + ": " + message.toString());

    // try {
    //     data = JSON.parse(msgString);
    // } catch (err) {
    //     console.log("Invalid JSON:", msgString);
    //     return;
    // }

    // Individual JSON values:
    let pumpState = data.state;
    let moisture1 = data.moisture1;
    let moisture2 = data.moisture2;

    // Update statusDiv:
    statusDiv.innerHTML = "Status: " + pumpState;
    moisture1Div.innerHTML = "Sensor 1: " + moisture1;
    moisture2Div.innerHTML = "Sensor 2: " +moisture2;
}


// On page load, call the setup function:
document.addEventListener('DOMContentLoaded', setup);
// // Run a loop every 2 seconds:
// setInterval(loop, 3000);







