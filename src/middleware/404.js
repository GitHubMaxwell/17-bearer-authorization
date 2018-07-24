'use strict';

// Custom 404 Handler because we always want to return a JSON response
export default (err,req,res,next) => {
  if(err === 404) {
    let error = {error:'Resource Not Found'};
    res.statusCode = 404;
    res.statusMessage = 'Not Found';
    res.setHeader('Content-Type', 'application/json');
    res.write( JSON.stringify(error) );
    res.end();
  } else {
    next(err);
  }
};