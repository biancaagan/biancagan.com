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
    rxClient.subscribe("blt/history");
    // Can subscribe to multiple topics

    // Send history:
    rxClient.publish("blt/history/request", "get");
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

    rxClient.publish("blt/water", waterVal);

    // Update last watering:
    const wateringTimestamp = new Date();

    const cleanVal = waterVal.replace(/,\s*no lettuce/, "").trim();
    const date = wateringTimestamp.toLocaleDateString();
    const time = wateringTimestamp.toLocaleTimeString();

    const entry = {
        state: `Last watered for ${cleanVal} seconds`,
        time: wateringTimestamp.toLocaleString()
    };

    statusDiv.innerHTML = entry.state + " on " + new Date().toLocaleDateString() + " at " + wateringTimestamp.toLocaleTimeString();

    const history = getHistory();
    history.push(entry);
    saveHistory(history);

    rxClient.publish("blt/history", JSON.stringify(entry));

    renderHistory();

    weeklyResetCheck();
    
}


// Handler for MQTT message received event:
function onMessage(topic, message) {
    // Message is a buffer, convert to a string:
    const msgString = message.toString();

    if (topic === "blt/history/request") {
        const history = getHistory();
        history.forEach(entry => {
            rxClient.publish("blt/history", JSON.stringify(entry));
        });
        return;
    }

    // FOR MOISTURE READINGS:
    if (topic === "blt/moisture"){
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
    
    if (topic === "blt/history"){
        let entry;

        try {
            entry = JSON.parse(msgString);
        } catch (err) {
            console.log("Invalid history:", msgString);
            return;
        }

        // Load current history
        const history = getHistory();

        // Avoid duplicates (important for MQTT echo)
        const exists = history.some(h =>
            h.time === entry.time && h.state === entry.state
        );

        if (!exists) {
            history.push(entry);
            saveHistory(history);
        }

        renderHistory();
        loadLastStatus();
    }
    

}

function loadLastStatus() {
    const history = getHistory();
    if (history.length === 0) return;

    const last = history[history.length - 1];

    statusDiv.innerHTML = entry.state + " on " + new Date().toLocaleDateString() + " at " + wateringTimestamp.toLocaleTimeString();
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
        historyDiv.innerHTML += `<br>${entry.time} -- ${entry.state}.`;
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
    loadLastStatus();
});









