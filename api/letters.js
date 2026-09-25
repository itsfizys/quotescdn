const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("letters", req.query || {}, res);