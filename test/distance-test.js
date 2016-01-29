import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use( sinonChai );

// Mock fetchDistanceBetween to always return 200
import * as helpers from '../app/helpers';
let fetchPromise = new Promise( ( resolve ) => resolve( 200 ) );

import { getDistanceBetween, getDistanceForUser } from '../app/models/distance';
import { connectToDb, disconnectFromDb, resetDb, mockUsers, mockLocations } from './bootstrap';

const expect = chai.expect;

describe( 'distances', function() {
  before( function( done ) {
    connectToDb( done );
  } );

  after( function() {
    disconnectFromDb();
  } );

  beforeEach( function( done ) {
    resetDb( done );
  } );

  describe( '.getDistanceBetween', function() {
    beforeEach( function( done ) {
      helpers.fetchDistanceBetween = sinon.stub().returns( fetchPromise );
      resetDb( done );
    } );

    it( 'returns the distance between the origin and destination if the distance is cached', function() {
      return getDistanceBetween( mockUsers.testUserId, mockLocations.homeLocation._id, mockLocations.coffeeLocation._id )
      .then( function( data ) {
        expect( data.distance ).to.eql( 600 );
      } );
    } );

    it( 'fetches the distance between the origin and destination if the distance is not cached', function() {
      return getDistanceBetween( mockUsers.testUserId, mockLocations.gameLocation._id, mockLocations.homeLocation._id )
      .then( function( data ) {
        expect( data.distance ).to.eql( 200 );
      } );
    } );

    it( 'does not call fetchDistanceBetween if the distance is cached', function() {
      return getDistanceBetween( mockUsers.testUserId, mockLocations.homeLocation._id, mockLocations.coffeeLocation._id )
      .then( function() {
        expect( helpers.fetchDistanceBetween ).to.not.have.been.called;
      } );
    } );

    it( 'calls fetchDistanceBetween with the correct arguments if the distance is not cached', function() {
      return getDistanceBetween( mockUsers.testUserId, mockLocations.gameLocation._id, mockLocations.homeLocation._id )
      .then( function() {
        expect( helpers.fetchDistanceBetween ).to.have.been.calledWith( mockLocations.gameLocation.address, mockLocations.homeLocation.address );
      } );
    } );

    it( 'expires the cached distance if it is older than five days', function() {
      return getDistanceBetween( mockUsers.testUserId, mockLocations.beachLocation._id, mockLocations.homeLocation._id )
      .then( function() {
        expect( helpers.fetchDistanceBetween ).to.have.been.calledOnce;
      } );
    } );

    it( 'caches the distance if the distance is not cached', function() {
      return getDistanceBetween( mockUsers.testUserId, mockLocations.gameLocation._id, mockLocations.homeLocation._id )
      .then( () => getDistanceBetween( mockUsers.testUserId, mockLocations.gameLocation._id, mockLocations.homeLocation._id ) )
      .then( function() {
        expect( helpers.fetchDistanceBetween ).to.have.been.calledOnce;
      } );
    } );
  } );

  describe( '.getDistanceForUser', function() {
    it( 'returns the total distance for all the tripLocations owned by that user', function() {
      return getDistanceForUser( mockUsers.testUserId )
      .then( function( data ) {
        expect( data.distance ).to.eql( 1000 );
      } );
    } );
  } );
} );
