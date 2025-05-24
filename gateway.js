const express = require("express");
const httpProxy = require("express-http-proxy");

const app = express();
const authServiceProxy =
httpProxy("http://localhost:3001");
const blogServiceProxy =
httpProxy("http://localhost:3002");
const commentServiceProxy =
httpProxy("http://localhost:3003");
const profileServiceProxy =
httpProxy("http://localhost:3004");
app.use(express.json());
app.use("/api/auth", (req, res, next) => { 
authServiceProxy(req, res, next);
});
app.use("/api/blog", (req, res, next) => {
 blogServiceProxy(req,
res, next);
});
app.use("/api/comment", (req, res, next) => {
commentServiceProxy(req, res, next);
});
app.use("/api/profile", (req, res, next) => {
profileServiceProxy(req, res, next);
});
app.use((req, res) => {
res.status(404).json({ error: "API endpoint not found" });
});
app.listen(3000, () => {
console.log("API Gateway running on port 3000");
});