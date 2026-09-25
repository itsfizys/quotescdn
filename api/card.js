const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("card", req.query || {}, res);