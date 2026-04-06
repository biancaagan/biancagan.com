// const mqtt = require("mqtt"); // skip in browser

const txClient = mqtt.connect("wss://blt-garden-v1:LxTKpBMbMyOsQfnz@blt-garden-v1.cloud.shiftr.io", {
  clientId: "blt-tx",
});

// client.on("connect", function () {
//   console.log("Connected!");

//   txClient.subscribe("blt");

//   setInterval(function () {
//   txClient.publish("blt", JSON.stringify({
//     state: "Watering...",
//     moisture1: 80,
//     moisture2: 43
//   }));
// }, 5000);
// });

txClient.on("connect", () => {
    // console.log("✅ Transmitter connected!");

    // Messages will only send if this interval is set after connection
    setInterval(() => {
        const payload = { 
          state: "Watering...", 
          moisture1: Math.floor(Math.random() * 100) + 1, 
          moisture2: Math.floor(Math.random() * 100) + 1
        };
        txClient.publish("blt", JSON.stringify(payload));
        console.log("Published:", payload); // this should appear in console
    }, 5000);
});

// client.on("message", function (topic, message) {
//   console.log(topic + ": " + message.toString());






