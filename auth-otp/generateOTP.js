const speakeasy=require('speakeasy')
const generateOTP = (secret) => {
  return speakeasy.totp({
      secret: secret,
      encoding: 'base32'
  });
};
module.exports={generateOTP}