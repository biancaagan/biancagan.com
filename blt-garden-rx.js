// const mqtt = require("mqtt"); // skip in browser

// let topic = 'blt';
// let topic = 'blt-testing'; // for testing
let topic = 'blt/moisture';
let rxClient;

let history = [];

// Divs to show messages:
let brokerDiv, statusDiv, moisture1Div, moisture2Div, moisture3Div, historyDiv;
// Whether the rxClient should be publishing or not:
let publishing = true;

function setup() {
    // Put the divs in variables for ease of use:
    brokerDiv = document.getElementById('brokerDiv');
    statusDiv = document.getElementById('statusDiv');
    moisture1Div = document.getElementById('moisture1Div');
    moisture2Div = document.getElementById('moisture2Div');
    moisture3Div = document.getElementById('moisture3Div');
    historyDiv = document.getElementById('historyDiv');

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

function isWriter() {
    const now = Date.now();
    const lock = JSON.parse(localStorage.getItem("historyLock"));

    if (!lock || now - lock.time > 2000) {
        localStorage.setItem("historyLock", JSON.stringify({ time: now }));
        return true;
    }
    return false;
}


function waterOverride() {
    document.getElementById("hiddenText").innerHTML = "Do you have the password?";

    // Select the element by its ID
    const waterUserInput = document.getElementById("waterInput");
    
    // Access the value property
    const waterVal = waterUserInput.value;

    rxClient.publish("blt/test", waterVal);

    // Update last watering:
    const wateringTimestamp = new Date();
    statusDiv.innerHTML = "Last watered for :" + waterVal + " seconds on " + new Date().toLocaleDateString() + " at " + wateringTimestamp.toLocaleTimeString();

    let d = new Date();
    let day = d.getDay();

    // Load existing history from localStorage:
    let storedHistory = JSON.parse(localStorage.getItem("history")) || [];

    // Get last reset date:
    let lastReset = localStorage.getItem("lastResetDate");
    let today = d.toDateString();

    if (!isWriter()) return;

    // Update statusDiv:
    // statusDiv.innerHTML = pumpState;

    if (day != 0){      // Not Sunday
        // Add most recent message:
        const entry = {
            state: "Last watered for :" + waterVal + " seconds on " + new Date().toLocaleDateString() + " at " + wateringTimestamp.toLocaleTimeString(),
            time: d.toLocaleString()
        };

        storedHistory.push(entry);

        // Save back to localStorage:
        localStorage.setItem("history", JSON.stringify(storedHistory));

        // Updated historyDiv:
        historyDiv.innerHTML += "<br>" + entry.time + " -- " + entry.state;

    } else {
        // Sunday = clear history ONCE:
        if (lastReset !== today){
            storedHistory = [];
            localStorage.removeItem("history");
            localStorage.setItem("lastResetDate", today);
            historyDiv.innerHTML = "";
        }
    }
}


// Handler for MQTT message received event:
function onMessage(topic, message) {
    // Message is a buffer, convert to a string:
    const msgString = message.toString();
    const data = JSON.parse(msgString);

    // console.log(topic + ": " + message.toString());

    try {
        data = JSON.parse(msgString);
    } catch (err) {
        console.log("Invalid JSON:", msgString);
        return;
    }

    // Individual JSON values:
    let moisture1 = data.moisture1;
    let moisture2 = data.moisture2;
    let moisture3 = data.moisture3;

    // let d = new Date();
    // let day = d.getDay();

    // // Load existing history from localStorage:
    // let storedHistory = JSON.parse(localStorage.getItem("history")) || [];

    // // Get last reset date:
    // let lastReset = localStorage.getItem("lastResetDate");
    // let today = d.toDateString();

    // Update statusDiv:
    moisture1Div.innerHTML = moisture1 + "%";
    moisture2Div.innerHTML = moisture2 + "%";
    moisture3Div.innerHTML = moisture3 + "%";

}

    // // 
    // if (topic.includes('blt/moisture')){
    //     // Update statusDiv:
    //     moisture1Div.innerHTML = moisture1 + "%";
    //     moisture2Div.innerHTML = moisture2 + "%";
    //     moisture3Div.innerHTML = moisture3 + "%";
    // } else if (topic == 'blt/water'){
        // if (!isWriter()) return;

        // // Update statusDiv:
        // statusDiv.innerHTML = pumpState;

        // if (day != 0){      // Not Sunday
        //     // Add most recent message:
        //     const entry = {
        //         state: pumpState,
        //         time: d.toLocaleString()
        //     };

        //     storedHistory.push(entry);

        //     // Save back to localStorage:
        //     localStorage.setItem("history", JSON.stringify(storedHistory));

        //     // Updated historyDiv:
        //     historyDiv.innerHTML += "<br>" + entry.time + " -- " + entry.state;
    
        // } else {
        //     // Sunday = clear history ONCE:
        //     if (lastReset !== today){
        //         storedHistory = [];
        //         localStorage.removeItem("history");
        //         localStorage.setItem("lastResetDate", today);
        //         historyDiv.innerHTML = "";
        //     }
        // }


    // // Update historyDiv:
    // if (day != 0){
    //     // Add most recent message:
    //     const entry = {
    //         state: pumpState,
    //         time: d.toLocaleString()
    //     };

    //     storedHistory.push(entry);

    //     // Save back to localStorage:
    //     localStorage.setItem("history", JSON.stringify(storedHistory));

    //     // Updated historyDiv:
    //     historyDiv.innerHTML += "<br>" + entry.time + " -- " + entry.state;
   
    // } else if (day == 0){
    //     // Sunday = clear history
    //     storedHistory = [];
    //     localStorage.removeItem("history");
    //     historyDiv.innerHTML = "";
    // }



function weeklyResetCheck() {
    const d = new Date();
    const day = d.getDay(); // 0 = Sunday
    const today = d.toDateString();

    let lastReset = localStorage.getItem("lastResetDate");

    if (day === 0 && lastReset !== today) {
        localStorage.removeItem("history");
        localStorage.setItem("lastResetDate", today);
    }
}


// On page load, call the setup function:
document.addEventListener('DOMContentLoaded', setup);
document.addEventListener('DOMContentLoaded', weeklyResetCheck);








