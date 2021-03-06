var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "My Discord Bot",
  description: "To run my node discord bot as a windows service.",
  script: require("path").join(__dirname, "bot.js"),
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("install", function () {
  svc.start();
});

svc.install();
