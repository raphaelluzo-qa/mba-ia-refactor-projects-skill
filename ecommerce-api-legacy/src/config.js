const config = Object.freeze({
  port: Number(process.env.PORT || 3000),
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  paymentGatewayKey: process.env.PAYMENT_GATEWAY_KEY,
  smtpUser: process.env.SMTP_USER,
});

module.exports = config;
