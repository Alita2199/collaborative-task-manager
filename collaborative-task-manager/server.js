require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http'); // Import the http module
const socketIo = require('socket.io'); // Import Socket.IO
const taskRoutes = require('./routes/tasks'); // Ensure this path is correct

const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server);

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files (like styles.css)

// Middleware to parse JSON requests
app.use(express.json());

// Log the MongoDB URI to check its value
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Store usernames
    const users = {};

    // Set username when user connects
    socket.on('setUsername', (username) => {
        users[socket.id] = username;
        console.log(`${username} has connected.`);
        // Notify all users
        io.emit('userNotification', `${username} has joined the chat.`);
    });

    // Handle task addition
    socket.on('taskAdded', (task) => {
        const username = users[socket.id]; // Get username for the current socket
        const taskWithUser = { ...task, username }; // Add username to task
        // Broadcast the new task to all connected clients
        socket.broadcast.emit('newTask', taskWithUser);
        // Notify all users about the new task
        io.emit('taskNotification', `${username} added a new task: ${task.title}`);
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            console.log(`${username} disconnected.`);
            io.emit('userNotification', `${username} has left the chat.`);
            delete users[socket.id]; // Remove user from the list
        }
    });
});


// Routes
app.use('/api/tasks', taskRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
