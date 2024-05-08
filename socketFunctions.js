
//new connection setup
const newSocketConnection=(jsonData,socket,allClients,password)=>{
    if(jsonData.uname !=null){
        //isadmin
        if(jsonData.password === password){
            allClients[jsonData.uname] = {admin:true,socket:socket,ref:jsonData.ref,time:new Date().toLocaleTimeString(),key:undefined}
            console.log(`[+] admin created ${jsonData.uname} | total ${Object.keys(allClients).length}`);
        }
        //isclient
        else if(jsonData.ref!=null){
            allClients[jsonData.uname] = {admin:false,socket:socket,ref:jsonData.ref,time:new Date().toLocaleTimeString(),key:undefined}
            console.log(`[+] client created ${jsonData.uname}| total ${Object.keys(allClients).length}`);
        }
        //is no one
        else{
            socket.close();
        }
    }
}

const getClientsList=(allClients,clientName)=>{
    let clients ="";
    Object.keys(allClients).forEach(item=>{
        if(allClients[item].ref === clientName){
            clients +=`${item} : ${allClients[item].time}\n`
        }
    });
    if (clients === ""){clients="No Clients Available"}
    return clients;
}

const globalSendMessage=(socket,data)=>{
    try{
        socket.send(data.toString())
    }catch(e){
        try{
            socket.write(data.toString())
        }catch(e){
            return false
        }
    }
}

const handleSocketClose=(allClients,socket)=>{
    try{
        const clientName = Object.keys(allClients).find(key => allClients[key].socket === socket);
        delete allClients[clientName]
        return `[-] Removed ${clientName}`
    }catch(e){
        return false
    }
}

const setClientAndSendKey=(allClients,clientName,username)=>{
    //set client username for admin
    try{
        allClients[clientName].ref = username
        return `enc|${allClients[username].key}`
    }catch(e){console.log(e);return false}
}

const setKey=(allClients,clientName,key)=>{
    try{allClients[clientName].key = key;
        return `[+] Key set for ${clientName}`}
    catch(e){return false};
}


module.exports ={newSocketConnection,getClientsList,globalSendMessage,handleSocketClose,setClientAndSendKey,setKey}
