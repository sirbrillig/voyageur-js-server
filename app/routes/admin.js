import * as eventLog from '../models/log';

export default {
  get( req, res ) {
    eventLog.getAllEvents()
    .then( ( data ) => {
      res.status( 200 ).json( data );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } );
  }
}

