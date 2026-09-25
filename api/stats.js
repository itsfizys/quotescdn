const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("stats", req.query || {}, res);