const chai = require( 'chai' );
const chaiAsPromised = require( 'chai-as-promised' );
const tripLocations = require( '../app/models/trip-location' );
import { connectToDb, disconnectFromDb, resetDb, models, mockUsers, mockTrips, mockLocations, mockTripLocations } from './bootstrap';

chai.use( chaiAsPromised );
const expect = chai.expect;

describe( 'tripLocations', function() {
  before( function( done ) {
    connectToDb( done );
  } );

  after( function() {
    disconnectFromDb();
  } );

  beforeEach( function( done ) {
    resetDb( done );
  } );

  describe( '.listTripLocationsForUser', function() {
    it( 'returns an Array', function() {
      return expect( tripLocations.listTripLocationsForUser( mockUsers.testUserId ) ).to.eventually.be.an.instanceOf( Array );
    } );

    it( 'returns an array with all current TripLocations', function() {
      return tripLocations.listTripLocationsForUser( mockUsers.testUserId2 )
      .then( function( data ) {
        expect( data.map( x => x.location ) ).to.eql( mockTrips.testUserTrip2.tripLocations.map( x => x.location._id ) );
      } );
    } );

    it( 'returns an array that does not include TripLocations from other users', function() {
      return tripLocations.listTripLocationsForUser( mockUsers.testUserId )
      .then( function( data ) {
        expect( data.map( x => x.location ) ).to.eql( mockTrips.testUserTrip.tripLocations.map( x => x.location._id ) );
      } );
    } );
  } );

  describe( '.addLocationToTrip', function() {
    it( 'creates a new TripLocation with the parameters specified', function() {
      const params = { location: mockLocations.gameLocation._id };
      return tripLocations.addLocationToTrip( mockUsers.testUserId, params )
      .then( function( data ) {
        expect( data.location ).to.eql( params.location );
      } );
    } );

    it( 'creates a new TripLocation without non-whitelisted parameters', function() {
      const params = { foo: 'bar', location: mockLocations.gameLocation._id };
      return tripLocations.addLocationToTrip( mockUsers.testUserId, params )
      .then( function( data ) {
        expect( data.foo ).to.not.exist;
      } );
    } );

    it( 'adds the TripLocation to the end of the user\'s list', function() {
      const params = { location: mockLocations.workLocation._id };
      return tripLocations.addLocationToTrip( mockUsers.testUserId2, params )
      .then( () => tripLocations.listTripLocationsForUser( mockUsers.testUserId2 ) )
      .then( function( data ) {
        const last = data[ data.length - 1 ];
        expect( last.location ).to.eql( params.location );
      } );
    } );
  } );

  describe( '.removeAllTripLocations', function() {
    it( 'removes all the TripLocations for the user', function() {
      return tripLocations.removeAllTripLocations( mockUsers.testUserId2 )
      .then( () => tripLocations.listTripLocationsForUser( mockUsers.testUserId2 ) )
      .then( ( data ) => {
        expect( data ).to.be.empty;
      } );
    } );

    it( 'does not remove TripLocations for other users', function() {
      return tripLocations.removeAllTripLocations( mockUsers.testUserId2 )
      .then( () => tripLocations.listTripLocationsForUser( mockUsers.testUserId ) )
      .then( ( data ) => {
        expect( data ).to.not.be.empty;
      } );
    } );

    it( 'returns the empty list', function() {
      return tripLocations.removeAllTripLocations( mockUsers.testUserId2 )
      .then( ( data ) => {
        expect( data ).to.be.empty;
      } );
    } );
  } );

  describe( '.removeTripLocationForUser', function() {
    it( 'removes the TripLocation from the database', function() {
      let locationCount = 0;
      return models.TripLocation.find()
      .then( ( initialData ) => {
        locationCount = initialData.length;
        return tripLocations.removeTripLocationForUser( mockUsers.testUserId2, mockTripLocations.teaTripLocation )
      } )
      .then( () => models.TripLocation.find() )
      .then( function( data ) {
        expect( data ).to.have.length( locationCount - 1 );
      } );
    } );

    it( 'removes the TripLocation from the user\'s trip', function() {
      const currentTripLocations = mockTrips.testUserTrip2.tripLocations.map( x => x._id )
      .reduce( ( prev, next ) => {
        if ( next === mockTripLocations.teaTripLocation._id ) return prev;
        return prev.concat( next );
      }, [] );
      return tripLocations.removeTripLocationForUser( mockUsers.testUserId2, mockTripLocations.teaTripLocation )
      .then( () => tripLocations.listTripLocationsForUser( mockUsers.testUserId2 ) )
      .then( function( data ) {
        expect( data.map( x => x._id ) ).to.eql( currentTripLocations );
      } );
    } );

    it( 'does not remove the TripLocation if it exists for a different user', function( done ) {
      return tripLocations.removeTripLocationForUser( mockUsers.testUserId, mockTripLocations.teaTripLocation._id )
      .then( function( data ) {
        done( `expected a rejection, but got ${data}` );
      } )
      .catch( function() {
        done();
      } );
    } );

    it( 'returns the removed TripLocation', function() {
      return tripLocations.removeTripLocationForUser( mockUsers.testUserId2, mockTripLocations.teaTripLocation._id )
      .then( function( tripLocation ) {
        expect( tripLocation.location ).to.eql( mockTripLocations.teaTripLocation.location._id );
      } );
    } );
  } );

  describe( '.getTripLocationForUser', function() {
    it( 'returns the TripLocation if it exists for a user', function() {
      return tripLocations.getTripLocationForUser( mockUsers.testUserId2, mockTripLocations.teaTripLocation._id )
      .then( function( data ) {
        expect( data ).to.have.property( '_id' ).eql( mockTripLocations.teaTripLocation._id );
        expect( data.location ).to.eql( mockTripLocations.teaTripLocation.location._id );
      } );
    } );

    it( 'does not return the location if it exists for a different user', function( done ) {
      return tripLocations.getTripLocationForUser( mockUsers.testUserId, mockTripLocations.teaTripLocation._id )
      .catch( function() {
        done();
      } );
    } );
  } );

  describe( '.updateTripForUser', function() {
    it( 'returns re-ordered TripLocations', function() {
      const ids = [ mockTripLocations.foodTripLocation._id, mockTripLocations.teaTripLocation._id ];
      expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids ) ).to.eventually.eql( ids );
    } );

    it( 're-orders existing TripLocations', function( done ) {
      const ids = [ mockTripLocations.foodTripLocation._id, mockTripLocations.teaTripLocation._id ];
      tripLocations.updateTripForUser( mockUsers.testUserId2, ids )
      .then( () => tripLocations.listTripLocationsForUser( mockUsers.testUserId2 ) )
      .then( function( data ) {
        const newIds = data.map( loc => loc._id );
        if ( newIds.toString() === ids.toString() ) return done();
        done( `TripLocations were not re-ordered; expected ${ids.toString()}, got ${newIds.toString()}` );
      } );
    } );

    it( 'does not re-order collection if params include a duplicate TripLocation ID', function() {
      const ids = [ mockTripLocations.foodTripLocation._id, mockTripLocations.teaTripLocation._id, mockTripLocations.teaTripLocation._id ];
      const oldIds = [ mockTripLocations.teaTripLocation._id, mockTripLocations.foodTripLocation._id ];
      expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids ) ).to.eventually.eql( oldIds );
    } );

    it( 'does not re-order collection if params do not include all TripLocation IDs', function() {
      const ids = [ mockTripLocations.foodTripLocation._id ];
      const oldIds = [ mockTripLocations.teaTripLocation._id, mockTripLocations.foodTripLocation._id ];
      expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids ) ).to.eventually.eql( oldIds );
    } );

    it( 'does not re-order collection if params include a TripLocation ID for another user', function() {
      const ids = [ mockTripLocations.foodTripLocation._id, mockTripLocations.homeTripLocation._id ];
      const oldIds = [ mockTripLocations.teaTripLocation._id, mockTripLocations.foodTripLocation._id ];
      expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids ) ).to.eventually.eql( oldIds );
    } );
  } );
} );
