import * as eventLog from '../models/log';

export default {
  get( req, res ) {
    const { page } = req.body;
    eventLog.getAllEvents( { page } )
    .then( ( data ) => {
      res.status( 200 ).json( data );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } );
  }
}

