// const mqtt = require("mqtt"); // skip in browser

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

    const myId = sessionStorage.getItem("tabId") || crypto.randomUUID();
    sessionStorage.setItem("tabId", myId);

    if (!lock || now - lock.time > 3000 || lock.owner === myId) {
        localStorage.setItem("historyLock", JSON.stringify({
            time: now,
            owner: myId
         }));
        return true;
    }
    return false;
}


function waterOverride() {
    document.getElementById("hiddenText").innerHTML = "Do you have the password?";

    if (!isWriter()) return;

    // Select the element by its ID
    const waterUserInput = document.getElementById("waterInput");
    
    // Access the value property
    const waterVal = waterUserInput.value;

    rxClient.publish("blt/test", waterVal);

    // Update last watering:
    const wateringTimestamp = new Date();

    statusDiv.innerHTML = `Last watered for ${waterVal.replace(/,\s*no lettuce/, "")} seconds on ${wateringTimestamp.toLocaleDateString()} at ${wateringTimestamp.toLocaleTimeString()}`;

    const entry = {
    state: `Last watered for ${waterVal.replace(/,\s*no lettuce/, "")} seconds on ${wateringTimestamp.toLocaleDateString()} at ${wateringTimestamp.toLocaleTimeString()}`,
    time: wateringTimestamp.toLocaleString()
};

    const history = getHistory();
    history.push(entry);
    saveHistory(history);

    renderHistory();

    weeklyResetCheck();
    
}


// Handler for MQTT message received event:
function onMessage(topic, message) {
    // Message is a buffer, convert to a string:
    const msgString = message.toString();
    
    let data;

    try {
        data = JSON.parse(msgString);
    } catch (err) {
        console.log("Invalid JSON:", msgString);
        return;
    }

    // Update statusDiv:
    moisture1Div.innerHTML = data.moisture1 + "%";
    moisture2Div.innerHTML = data.moisture2 + "%";
    moisture3Div.innerHTML = data.moisture3 + "%";

}

function getHistory() {
    return JSON.parse(localStorage.getItem("history")) || [];
}

function saveHistory(history) {
    localStorage.setItem("history", JSON.stringify(history));
}

function renderHistory() {
    const history = getHistory();
    historyDiv.innerHTML = "";

    history.forEach(entry => {
        historyDiv.innerHTML += `<br>${entry.time} -- ${entry.state}`;
    });
}
  
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
document.addEventListener('DOMContentLoaded', () => {
    setup();
    weeklyResetCheck();
    renderHistory();
});









