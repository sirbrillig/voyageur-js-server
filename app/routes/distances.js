import { getUserIdFromRequest } from '../helpers';
import { getDistanceForUser, getDistanceForAddresses } from '../models/distance';

export default {
  get( req, res ) {
    const userId = getUserIdFromRequest( req );
    getDistanceForUser( userId )
    .then( ( distance ) => {
      res.status( 200 ).json( distance );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 400 ).send( err.message );
    } );
  },

  post( req, res ) {
    const { start, dest } = req.body;
    getDistanceForAddresses( [ start, dest ] )
    .then( distance => res.status( 200 ).json( distance ) )
    .catch( err => {
      req.error( {}, err.message );
      res.status( 400 ).send( err.message );
    } );
  }
};
