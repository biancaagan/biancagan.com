// // const mqtt = require("mqtt"); // skip in browser

// const client = mqtt.connect("wss://blt-garden-v1.cloud.shiftr.io", {
//     clientId: "blt-tx-" + Math.random().toString(16).substr(2, 8),
//     username: "blt-garden-v1",
//     password: "LxTKpBMbMyOsQfnz"
// });

// client.on("connect", function () {
//   console.log("Connected!");

//   client.subscribe("blt");

//   setInterval(function () {
//   client.publish("blt", JSON.stringify({
//     state: "Watering...",
//     moisture1: 80,
//     moisture2: 43
//   }));
// }, 5000);

    

//   //   client.publish("blt", "{state: Watering..., moisture1: 80}");
//   // }, 5000);
// });

// // client.on("message", function (topic, message) {
// //   console.log(topic + ": " + message.toString());






// Use the global 'mqtt' object provided by the script tag
const client = mqtt.connect("wss://blt-garden-v1.cloud.shiftr.io", {
    clientId: "blt-tx-" + Math.random().toString(16).substr(2,8),
    username: "blt-garden-v1",
    password: "LxTKpBMbMyOsQfnz"
});

client.on("connect", function() {
    console.log("Connected to broker!");

    setInterval(function() {
        const payload = {
            state: "Watering...",
            moisture1: Math.floor(Math.random() * 100),
            moisture2: Math.floor(Math.random() * 100)
        };
        client.publish("blt", JSON.stringify(payload));
        console.log("Published:", payload);
    }, 5000);
});

client.on("error", function(err) {
    console.error("Connection error:", err);
});