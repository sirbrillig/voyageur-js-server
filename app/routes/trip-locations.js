import { getUserIdFromRequest } from '../helpers';
import {
  listTripLocationsForUser,
  removeAllTripLocations,
  updateTripForUser,
} from '../models/trip-location';

export default {
  list( req, res ) {
    const userId = getUserIdFromRequest( req );
    listTripLocationsForUser( userId )
    .then( ( locations ) => {
      res.status( 200 ).json( locations );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err.toString() );
    } );
  },

  updateList( req, res ) {
    const userId = getUserIdFromRequest( req );
    const { tripLocationIds, date } = req.body;
    updateTripForUser( userId, tripLocationIds, date )
    .then( ( updatedLocations ) => {
      res.status( 200 ).json( updatedLocations );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err.toString() );
    } );
  },

  deleteAll( req, res ) {
    const userId = getUserIdFromRequest( req );
    removeAllTripLocations( userId )
    .then( ( tripLocations ) => {
      res.status( 200 ).json( tripLocations );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err.toString() );
    } );
  },
};
