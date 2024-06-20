const speakeasy=require('speakeasy')
const generateSecret = () => {
  return speakeasy.generateSecret({ length: 20 });
};
module.exports={generateSecret}

