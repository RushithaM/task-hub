/**
 * Health check controller
 * Returns server status, uptime, and timestamp
 */

const startTime = Date.now();

export const getHealth = (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000); // uptime in seconds
  
  res.json({
    status: 'ok',
    uptime,
    timestamp: new Date().toISOString(),
  });
};

