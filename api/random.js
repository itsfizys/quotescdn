const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("random", req.query || {}, res);