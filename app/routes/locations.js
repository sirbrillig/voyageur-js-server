import { getUserIdFromRequest } from '../helpers';
import {
  listLocationsForUser,
  createNewLocationForUser,
  getLocationForUser,
  updateLocationListForUser,
  updateLocationForUser,
  removeLocationForUser
} from '../models/location';

export default {
  list( req, res ) {
    const userId = getUserIdFromRequest( req );
    listLocationsForUser( userId )
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
    const { name, address } = req.body;
    createNewLocationForUser( userId, { name, address } )
    .then( ( location ) => {
      res.status( 200 ).json( location );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } );
  },

  get( req, res ) {
    const userId = getUserIdFromRequest( req );
    const { locationId } = req.params;
    getLocationForUser( userId, locationId )
    .then( ( location ) => {
      res.status( 200 ).json( location );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } );
  },

  updateList( req, res ) {
    const userId = getUserIdFromRequest( req );
    const { locations } = req.body;
    updateLocationListForUser( userId, locations )
    .then( ( updatedLocations ) => {
      res.status( 200 ).json( updatedLocations );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } );
  },

  update( req, res ) {
    const userId = getUserIdFromRequest( req );
    const { name, address } = req.body;
    const { locationId } = req.params;
    updateLocationForUser( userId, locationId, { name, address } )
    .then( ( location ) => {
      res.status( 200 ).json( location );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } );
  },

  delete( req, res ) {
    const userId = getUserIdFromRequest( req );
    const { locationId } = req.params;
    removeLocationForUser( userId, locationId )
    .then( ( location ) => {
      res.status( 200 ).json( location );
    } )
    .catch( ( err ) => {
      req.error( {}, err.message );
      res.status( 502 ).send( err );
    } )
  }
};
