const chai = require( 'chai' );
const chaiAsPromised = require( 'chai-as-promised' );
const tripLocations = require( '../app/models/trip-location' );
import { connectToDb, disconnectFromDb, resetDb, models, mockUsers, mockTrips, mockLocations } from './bootstrap';
import { removeLocationForUser } from '../app/models/location';

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
        expect( data ).to.eql( mockTrips.testUserTrip2.tripLocations );
      } );
    } );

    it( 'returns an array that does not include TripLocations from other users', function() {
      return tripLocations.listTripLocationsForUser( mockUsers.testUserId )
      .then( function( data ) {
        expect( data ).to.eql( mockTrips.testUserTrip.tripLocations );
      } );
    } );

    it( 'does not return any TripLocations that have no associated Location', function() {
      const expectedTripLocations = mockTrips.testUserTrip.tripLocations.filter( loc => loc !== mockLocations.homeLocation._id );
      return removeLocationForUser( mockUsers.testUserId, mockLocations.homeLocation._id )
      .then( function() {
        return tripLocations.listTripLocationsForUser( mockUsers.testUserId )
        .then( function( data ) {
          expect( data ).to.eql( expectedTripLocations );
        } );
      } );
    } );
  } );

  describe( '.removeAllTripLocations', function() {
    it( 'removes all the TripLocations for the user', function() {
      return tripLocations.removeAllTripLocations( mockUsers.testUserId2 )
      .then( () => models.Trip.findOne( { userId: mockUsers.testUserId2 } ) )
      .then( ( data ) => {
        expect( data.tripLocations ).to.be.empty;
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

  describe( '.updateTripForUser', function() {
    it( 'returns re-ordered TripLocations', function() {
      const ids = [ mockLocations.foodLocation._id, mockLocations.teaLocation._id ];
      const date = Date.now();
      return expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids, date ) ).to.eventually.eql( ids );
    } );

    it( 're-orders existing TripLocations', function( done ) {
      const ids = [ mockLocations.foodLocation._id, mockLocations.teaLocation._id ];
      const date = Date.now();
      tripLocations.updateTripForUser( mockUsers.testUserId2, ids, date )
      .then( () => tripLocations.listTripLocationsForUser( mockUsers.testUserId2 ) )
      .then( function( data ) {
        const newIds = data;
        if ( newIds.toString() === ids.toString() ) return done();
        done( `TripLocations were not re-ordered; expected ${ids.toString()}, got ${newIds.toString()}` );
      } );
    } );

    it( 're-orders collection if params include a duplicate TripLocation ID', function() {
      const ids = [ mockLocations.foodLocation._id, mockLocations.teaLocation._id, mockLocations.teaLocation._id ];
      const date = Date.now();
      return expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids, date ) ).to.eventually.eql( ids );
    } );

    it( 'creates a new TripLocation if one is added', function() {
      const ids = [ mockLocations.foodLocation._id, mockLocations.teaLocation._id, mockLocations.workLocation._id ];
      const date = Date.now();
      return expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids, date ) ).to.eventually.eql( ids );
    } );

    it( 'removes TripLocations from collection if params do not include all TripLocation IDs', function() {
      const ids = [ mockLocations.foodLocation._id ];
      const date = Date.now();
      return expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids, date ) ).to.eventually.eql( ids );
    } );

    it( 'does not add location to collection if params include a TripLocation ID for another user', function() {
      const ids = [ mockLocations.foodLocation._id, mockLocations.homeLocation._id ];
      const date = Date.now();
      return expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids, date ) ).to.eventually.be.rejected;
    } );

    it( 'does not add location to collection if param include a date which is older than the lastUpdated date', function() {
      const ids = [ mockLocations.foodLocation._id ];
      const date = new Date( ( new Date() ).valueOf() - 1000 * 60 * 60 ).getTime();
      return expect( tripLocations.updateTripForUser( mockUsers.testUserId2, ids, date ) ).to.eventually.eql( mockTrips.testUserTrip2.tripLocations );
    } );
  } );
} );
