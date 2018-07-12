'use strict';

export default  (err,req,res,next) => {
  if (err === 401) {
    res.statusCode = 401;
    res.statusMessage = 'Invalid Body';
    // res.setHeader('Content-Type', 'application/json');
    // res.write( JSON.stringify(error) );
    res.end();
  } else {
    next(err);
  }
};