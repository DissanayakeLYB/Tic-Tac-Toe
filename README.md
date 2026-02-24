# 🎮 Online Tic-Tac-Toe

A real-time, multiplayer Tic-Tac-Toe game that you can play with your friends online. This project uses **Node.js**, **Express**, and **Socket.io** for seamless real-time interaction.

## ✨ Features
- **Real-time Gameplay**: Play moves instantly across distances.
- **Room System**: Create or join specific rooms using a custom code.
- **Dynamic UI**: Responsive design for mobile and desktop play.
- **Live Sync**: Game state is synchronized for both players automatically.

## ️ Built With
- **Frontend**: HTML5, Vanilla CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.io

## 🚀 Running the Project

### Running the Backend
1. Open a terminal and navigate to the `backend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm start` (or `node server.js`) to start the Socket.io server.

### Running the Frontend
1. Open the `frontend` directory.
2. You can just open `index.html` in your browser! Or use a static file server like Live Server.

## 🌍 Easy Deployment
- **Frontend**: Deploy the `frontend/` folder directly to **Netlify** (Base directory: `/frontend`).
- **Backend**: Deploy the `backend/` folder to **Render** or **Railway** (Root directory: `backend`).
- **Important**: Once you deploy your backend, make sure to change the `BACKEND_URL` variable in `frontend/script.js` to point to your new backend URL!
