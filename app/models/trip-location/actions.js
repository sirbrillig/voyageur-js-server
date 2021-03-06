import { Promise } from 'es6-promise';
import Trip from '../../models/trip';
import { removeElementFromArray } from '../../helpers';
import { getLocationForUser } from '../../models/location';

export function removeAllTripLocations( userId ) {
  return new Promise( ( resolve, reject ) => {
    findOrCreateTripForUser( userId )
    .then( ( collection ) => {
      collection.tripLocations = [];
      collection.save( ( saveErr ) => {
        if ( saveErr ) return reject( saveErr );
        resolve( collection.tripLocations );
      } );
    } )
    .catch( reject );
  } );
}

export function removeTripLocationForUser( userId, tripLocationId ) {
  return new Promise( ( resolve, reject ) => {
    findOrCreateTripForUser( userId )
    .then( ( collection ) => {
      collection.tripLocations = removeElementFromArray( collection.tripLocations, tripLocationId._id || tripLocationId );
      removeTripLocation( tripLocationId._id || tripLocationId, userId )
      .then( ( tripLocation ) => {
        collection.save( ( saveErr ) => {
          if ( saveErr ) return reject( saveErr );
          resolve( tripLocation );
        } );
      } )
      .catch( reject );
    } );
  } );
}

function removeTripLocation( tripLocationId, userId ) {
  return new Promise( ( resolve, reject ) => {
    findOrCreateTripForUser( userId )
    .then( collection => {
      collection.tripLocations = collection.tripLocations.filter( x => x !== tripLocationId );
      return collection.save()
      .then( () => resolve( collection ) );
    } )
    .catch( reject );
  } );
}

function updateTripLocationsInCollection( collection, tripLocationIds, date ) {
  return new Promise( ( resolve, reject ) => {
    // Silently fail if the update is old, because we've probably already got the new data
    if ( collection.lastUpdated.getTime() > date ) return resolve( collection );
    Trip.findByIdAndUpdate( collection._id, { lastUpdated: date, tripLocations: tripLocationIds }, { new: true } )
    .then( resolve )
    .catch( err => reject( new Error( 'Error saving trip: ' + err.toString() ) ) );
  } );
}

export function listTripLocationsForUser( userId ) {
  return new Promise( ( resolve, reject ) => {
    findOrCreateTripForUser( userId )
    .then( trip => resolve( trip.tripLocations ) )
    .catch( reject );
  } );
}

export function updateTripForUser( userId, tripLocationIds, date ) {
  return new Promise( ( resolve, reject ) => {
    Promise.all( tripLocationIds.map( loc => getLocationForUser( userId, loc ) ) )
    .then( () => {
      return findOrCreateTripForUser( userId )
      .then( trip => updateTripLocationsInCollection( trip, tripLocationIds, date ) )
      .then( trip => resolve( trip.tripLocations ) )
    } )
    .catch( reject );
  } );
}

function findOrCreateTripForUser( userId ) {
  return new Promise( ( resolve, reject ) => {
    Trip.findOrCreate( { userId }, ( err, trip ) => {
      if ( err ) return reject( err );
      resolve( trip );
    } );
  } );
}
