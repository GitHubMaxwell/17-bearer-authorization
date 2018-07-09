'use strict';

import User from '../models/dog-model.js';

export default (req, res, next) => {

  let authorize = (token) => {
    User.authorize(token)
      .then( user => {
        if(!user) {
        //   console.log('Authorize No User');
          getAuth();
        }
        else {
        //   console.log('Authorize going to Next', user);
          next();
        }
      })
      .catch(() => {
        next();
      });
  };

  let authenticate = (auth) => {
    // console.log('auth.js AUTHENTICATE');

    User.authenticate(auth)
      .then( user => {
        // console.log('BEFORE IF User.authenticate', user);

        if(!user) {
        //   console.log('auth.js authenticate NO USER ERROR', user);
          getAuth();
        }
        else {
          req.token = user.generateToken();
          next();
        }
      })
      .catch(() => {
        // console.log('auth.js authenticate ERROR');
        next();
      });
  };

  let getAuth = () => {
    // console.log('auth.js getAuth');
    next({
      status:401,
      statusMessage: 'Unauthorized getAuth',
      message: 'Invalid User ID/Password',
    });
  };

  ////////////////////////////////////////////

  try {

    if(!req.params.id && req.method === 'DELETE') {
      return getAuth();
    }

    if(!req.params.id && req.method === 'PUT') {
      return getAuth();
    }

    let auth = {};
    let authHeader = req.headers.authorization;
    //can also be req.get.authorization
    console.log('req.headers.authorization in TRY', authHeader);
    // console.log('PARAMS', req.params);

    if(!authHeader) {
      return getAuth();
    }

    

    if(authHeader.match(/basic/i)){
      let base64Header = authHeader.replace(/Basic\s+/i, '');
      let base64Buffer = Buffer.from(base64Header, 'base64');
      let bufferString = base64Buffer.toString();
      let [username,password] = bufferString.split(':');
      auth = {username,password};

      authenticate(auth);
    }
    /////////////////////////////////////////////
    else if(authHeader.match(/bearer/i)){

      let token = authHeader.replace(/bearer\s+/i, '');

      authorize(token);
      
    }
    /////////////////////////////////////////////
  }
  catch(e) {
    next(e);
  }
};