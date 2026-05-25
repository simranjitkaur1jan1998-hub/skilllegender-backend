require("dotenv").config();

const express = require ("express")
const app= express()
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket logic
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });
});

global.io = io;

const cors = require("cors");
app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extends: false }));
app.use(express.static("server/public"));
const db = require("./server/config/db");
const seed = require("./server/config/seed");
const PORT = process.env.PORT;

app.get("",(req,res)=>{
    res.send("Welcome to server")
})


//learnerMentor Routes
const learnerMentorRoutes = require("./server/routes/learnerMentorRoutes");
app.use("/learnerMentor", learnerMentorRoutes);

//admin Routes
const adminRoutes = require("./server/routes/adminRoutes");
app.use("/admin", adminRoutes);

server.listen(PORT, (err) => {
    if(err){
        console.log("Error in Server",err);  
    }
    else{
        console.log(`Server is running on  http://localhost:${PORT}`);     
    }
})