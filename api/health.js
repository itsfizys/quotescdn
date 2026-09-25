const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("health", req.query || {}, res);