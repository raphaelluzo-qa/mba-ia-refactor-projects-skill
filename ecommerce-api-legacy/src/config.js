const port = Number(process.env.PORT || 3000);
module.exports = { port, paymentGatewayKey: process.env.PAYMENT_GATEWAY_KEY || 'development-key' };
