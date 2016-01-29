import { getUserIdFromRequest } from '../helpers';
import { getDistanceForUser } from '../models/distance';

export default {
  get( req, res ) {
    const userId = getUserIdFromRequest( req );
    getDistanceForUser( userId )
    .then( ( distance ) => {
      res.status( 200 ).json( distance );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } );
  }
}
