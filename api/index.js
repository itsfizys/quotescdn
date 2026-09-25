const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("", req.query || {}, res);