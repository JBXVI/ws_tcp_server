//modules
const express =require("express");
const WebSocket = require("ws");
const net = require("net");
require("dotenv").config();
const crypt = require("./crypto");
const socketFunctions = require("./socketFunctions");
const routes = require("./routes");

//init express
const app = express();

//middle ware
app.use(express.json());
app.use(express.static('/ui'));

//express routes
app.use('/',routes);

//values
const KEY=process.env.KEY;
const PASSWORD = process.env.PASSWORD;
const WS_PORT = process.env.WS_PORT;
const TCP_PORT = process.env.TCP_PORT;
const HTTP_PORT = process.env.HTTP_PORT;

//all clients
const allClients ={};

//socket message
const handleSocketMessage=(data,socket)=>{
    //new connection
    try{socketFunctions.newSocketConnection(JSON.parse(crypt.Decrypt(data,KEY)),socket,allClients,PASSWORD)}
    catch(e){
        try{
            const clientName = Object.keys(allClients).find(key => allClients[key].socket === socket);
            splittedData = data.split("|")
            if(splittedData.length === 1 && splittedData[0]==="clients" && allClients[clientName].admin === true){
                let clients = socketFunctions.getClientsList(allClients,clientName)
                socketFunctions.globalSendMessage(socket,clients)
            }
            else if(splittedData.length ===2 && splittedData[0]==="client" && allClients[clientName].admin === true){
                let key = socketFunctions.setClientAndSendKey(allClients,clientName,splittedData[1]);
                if(key!=false){socketFunctions.globalSendMessage(socket,key)}
                else{socketFunctions.globalSendMessage(socket,`No User ${splittedData[1]}`)}
            }
            else if(splittedData.length ===2 && splittedData[0]==="enc" && splittedData[1].length ===1){
                console.log(socketFunctions.setKey(allClients,clientName,splittedData[1]))
            }
            else if(splittedData.length === 1 && allClients[clientName].ref != undefined){
                try{let to = allClients[clientName].ref;socketFunctions.globalSendMessage(allClients[to].socket,splittedData[0])}
                catch(e){socketFunctions.globalSendMessage(socket,`send Error`)}
            }
            
            
        }
        catch(e){}
        
    }
    
}

//websocket
const wss = new WebSocket.Server({port:WS_PORT});
wss.on('listening',()=>{console.log(`Websocket server on port : ${WS_PORT}`)})
wss.on('connection',(socket)=>{
    socket.on('message',(data)=>{handleSocketMessage(data.toString(),socket)})
    socket.on('close',()=>console.log(socketFunctions.handleSocketClose(allClients,socket)))
});

//tcp   
const tcpServer = net.createServer(socket=>{
    socket.on('data',(data)=>{handleSocketMessage(data.toString(),socket)})
    socket.on('error',()=>console.log(socketFunctions.handleSocketClose(allClients,socket)))
    socket.on('end',()=>console.log(socketFunctions.handleSocketClose(allClients,socket)))
});
tcpServer.listen(TCP_PORT,()=>{console.log(`tcp server on port : ${TCP_PORT}`)});

//express
app.listen(HTTP_PORT,()=>{console.log(`Express Server on port : ${HTTP_PORT}`)})

