const http = require('http');
const app = require('./app');
const server = http.createServer(app);

const { API_PORT } = process.env;

server.listen(API_PORT,"192.168.11.159",()=>{
    console.log("Server running");
})
// server.listen(API_PORT,"192.168.0.105",()=>{
//   console.log("Server running");
// })
