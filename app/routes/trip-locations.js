import { getUserIdFromRequest } from '../helpers';
import {
  listTripLocationsForUser,
  addLocationToTrip,
  getTripLocationForUser,
  removeAllTripLocations,
  removeTripLocationForUser,
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
      res.status( 502 ).send( err );
    } );
  },

  create( req, res ) {
    const userId = getUserIdFromRequest( req );
    const { location } = req.body;
    addLocationToTrip( userId, { location } )
    .then( ( tripLocation ) => {
      res.status( 200 ).json( tripLocation );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } );
  },

  get( req, res ) {
    const userId = getUserIdFromRequest( req );
    const { tripLocationId } = req.params;
    getTripLocationForUser( userId, tripLocationId )
    .then( ( tripLocation ) => {
      res.status( 200 ).json( tripLocation );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } );
  },

  updateList( req, res ) {
    const userId = getUserIdFromRequest( req );
    const { tripLocationIds } = req.body;
    updateTripForUser( userId, tripLocationIds )
    .then( ( updatedLocations ) => {
      res.status( 200 ).json( updatedLocations );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
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
      res.status( 502 ).send( err );
    } );
  },

  delete( req, res ) {
    const userId = getUserIdFromRequest( req );
    const { tripLocationId } = req.params;
    removeTripLocationForUser( userId, tripLocationId )
    .then( ( tripLocation ) => {
      res.status( 200 ).json( tripLocation );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } )
  }
};
