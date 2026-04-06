const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const {Server} = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.set('io', io); // Make io accessible in routes
io.on('connection', (socket) => {
  console.log('New client connected');
});
connectDB();
app.use(cors());
app.use(express.json());
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.listen(5000, () => console.log('Server running on port 5000'));