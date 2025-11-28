import mongoose from 'mongoose';

// Simple schema for keep-alive pings
const PingSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  type: { type: String, default: 'keep-alive' }
});

const Ping = mongoose.model('Ping', PingSchema);

// Keep MongoDB connection alive by doing a lightweight operation
export const startKeepAlive = () => {
  const INTERVAL = 5*  60 * 1000; 

  const ping = async () => {
    try {
      // Create a ping document
      const newPing = await Ping.create({ timestamp: new Date() });
      
      // Delete old pings (keep only last 5)
      const oldPings = await Ping.find()
        .sort({ timestamp: -1 })
        .skip(5);
      
      if (oldPings.length > 0) {
        await Ping.deleteMany({
          _id: { $in: oldPings.map(p => p._id) }
        });
      }
      
      console.log(`[Keep-Alive] MongoDB ping successful at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('[Keep-Alive] MongoDB ping failed:', error.message);
    }
  };

  // Initial ping
  ping();

  // Set up interval
  setInterval(ping, INTERVAL);
  
  console.log('[Keep-Alive] MongoDB keep-alive service started (every 2 days)');
};

export default { startKeepAlive };
