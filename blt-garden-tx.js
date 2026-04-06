const mqtt = require("mqtt"); // skip in browser

const client = mqtt.connect("mqtt://blt-garden-v1:LxTKpBMbMyOsQfnz@blt-garden-v1.cloud.shiftr.io", {
  clientId: "blt-tx",
});

client.on("connect", function () {
  console.log("Connected!");

  client.subscribe("blt");

  setInterval(function () {
    client.publish("blt", JSON.stringify({
      state: "Watering...",
      moisture1: 80,
      moisture2: 43
    }), 5000);

  //   client.publish("blt", "{state: Watering..., moisture1: 80}");
  // }, 5000);
});

// client.on("message", function (topic, message) {
//   console.log(topic + ": " + message.toString());
});