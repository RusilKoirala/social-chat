# Chat App

Real-time chat with React, Socket.IO, and MongoDB. Built because I needed to learn WebSockets.

## Stack

**Frontend:** React, Tailwind, Socket.IO Client  
**Backend:** Node.js, Express, MongoDB, Socket.IO  
**Auth:** JWT + Google OAuth + Email OTP

## Features

- Real-time messaging
- Friend requests (privacy first)
- Google OAuth + email signup
- Dark mode
- Rate limiting
- Message pagination
- Typing indicators

## Setup

```bash
# Install
cd server && npm install
cd ../client && npm install

# Configure
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files with your credentials

# Run
cd server && npm start
cd client && npm run dev
```

## Environment Variables

**server/.env:**
```
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
RESEND_API_KEY=your_key
CLIENT_URL=http://localhost:5173
```

**client/.env:**
```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_id
```

## Deploy

**Docker:**
```bash
docker-compose up -d
```

**Render:** See [RENDER_QUICK_START.md](./RENDER_QUICK_START.md)

## API

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
GET    /api/users
POST   /api/friends/request
GET    /api/messages/private/:userId
```

## Socket Events

```javascript
// Send
socket.emit('message:private', { to, message })
socket.emit('typing:start', { to })

// Receive
socket.on('message:private', (data) => {})
socket.on('user:online', (userId) => {})
```

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   └── package.json
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   └── server.js
└── docker-compose.yml
```

## Notes

- Free tier on Render has cold starts (~30s)
- MongoDB Atlas free tier: 512MB
- Rate limiting: 100 req/15min per IP
- OTP expires in 10 minutes

## License

MIT
