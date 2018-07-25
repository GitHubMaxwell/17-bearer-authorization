'use strict';

export default  (req,res) => {

  res.statusCode = 401;
  res.statusMessage = 'Invalid Body';
  // res.setHeader('Content-Type', 'application/json');
  // res.write( JSON.stringify(error) );
  res.end();
};