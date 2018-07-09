
'use strict';

export default  (err,req,res,next) => {
  if (err === 400) {
    res.statusCode = 400;
    res.statusMessage = 'Invalid Body';
    // res.setHeader('Content-Type', 'application/json');
    // res.write( JSON.stringify(error) );
    res.end();
  } else {
    next(err);
  }
};