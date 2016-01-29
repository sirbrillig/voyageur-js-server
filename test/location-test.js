const chai = require( 'chai' );
const chaiAsPromised = require( 'chai-as-promised' );
const locations = require( '../app/models/location' );
import { connectToDb, disconnectFromDb, resetDb, models, mockUsers, mockLocations } from './bootstrap';

chai.use( chaiAsPromised );
const expect = chai.expect;

describe( 'locations', function() {
  before( function( done ) {
    connectToDb( done );
  } );

  after( function() {
    disconnectFromDb();
  } );

  beforeEach( function( done ) {
    resetDb( done );
  } );

  describe( '.listLocationsForUser', function() {
    it( 'returns an Array', function() {
      return expect( locations.listLocationsForUser( mockUsers.testUserId ) ).to.eventually.be.an.instanceOf( Array );
    } );

    it( 'returns an array with all current Locations', function( done ) {
      locations.listLocationsForUser( mockUsers.testUserId )
      .then( function( data ) {
        if ( data.length === 1 && data[0].name === mockLocations.homeLocation.name && data[0].address === mockLocations.homeLocation.address ) return done();
        done( `location not found in ${JSON.stringify( data )}` );
      } );
    } );

    it( 'returns an array that does not include Locations from other users', function( done ) {
      locations.listLocationsForUser( mockUsers.testUserId2 )
      .then( function( data ) {
        if ( data.some( ( loc ) => {
          return ( loc.name !== mockLocations.homeLocation.name && loc.address !== mockLocations.homeLocation.address );
        } ) ) return done();
        done( `data did not match expected data in ${JSON.stringify( data )}` );
      } );
    } );
  } );

  describe( '.createNewLocationForUser', function() {
    it( 'creates a new location with the parameters specified', function( done ) {
      const params = { name: 'createNewLocationForUsertest', address: '1234 address place' };
      locations.createNewLocationForUser( mockUsers.testUserId, params )
      .then( function( data ) {
        if ( data.name === params.name && data.address === params.address ) return done();
        done( `location not returned, instead got: ${JSON.stringify( data )}` );
      } );
    } );

    it( 'creates a new location without non-whitelisted parameters', function( done ) {
      const params = { foo: 'bar', name: 'createNewLocationForUsertest', address: '1234 address place' };
      locations.createNewLocationForUser( mockUsers.testUserId, params )
      .then( function( data ) {
        if ( ! data.foo ) return done();
        done( `location included non-whitelisted parameter, instead got: ${JSON.stringify( data )}` );
      } );
    } );

    it( 'adds the location to the end of the user\'s list', function( done ) {
      const params = { name: 'createNewLocationForUsertest', address: '1234 address place' };
      locations.createNewLocationForUser( mockUsers.testUserId, params )
      .then( () => locations.listLocationsForUser( mockUsers.testUserId ) )
      .then( function( data ) {
        const lastLocation = data[ data.length - 1 ];
        if ( lastLocation.name === params.name && lastLocation.address === params.address ) return done();
        done( `expected new location added to end of locations, instead last location was ${JSON.stringify( lastLocation )}` );
      } );
    } );
  } );

  describe( '.removeLocationForUser', function() {
    it( 'removes the location from the database', function() {
      let locationCount = 0;
      return models.Location.find()
      .then( ( initialData ) => {
        locationCount = initialData.length;
        return locations.removeLocationForUser( mockUsers.testUserId, mockLocations.homeLocation )
      } )
      .then( () => models.Location.find() )
      .then( function( data ) {
        expect( data ).to.have.length( locationCount - 1 );
      } );
    } );

    it( 'removes the location from the user\'s list', function() {
      return locations.removeLocationForUser( mockUsers.testUserId, mockLocations.homeLocation )
      .then( () => locations.listLocationsForUser( mockUsers.testUserId ) )
      .then( function( data ) {
        expect( data ).to.be.empty;
      } );
    } );

    it( 'does not remove the location if it exists for a different user', function( done ) {
      return locations.removeLocationForUser( mockUsers.testUserId2, mockLocations.homeLocation._id )
      .then( function( data ) {
        done( `expected a rejection, but got ${data}` );
      } )
      .catch( function() {
        done();
      } );
    } );

    it( 'returns the removed location', function() {
      return locations.removeLocationForUser( mockUsers.testUserId, mockLocations.homeLocation._id )
      .then( function( location ) {
        const { name, address } = location;
        expect( name ).to.eql( mockLocations.homeLocation.name );
        expect( address ).to.eql( mockLocations.homeLocation.address );
      } );
    } );
  } );

  describe( '.getLocationForUser', function() {
    it( 'returns the location if it exists for a user', function() {
      return locations.getLocationForUser( mockUsers.testUserId, mockLocations.homeLocation._id )
      .then( function( data ) {
        expect( data ).to.have.property( '_id' ).eql( mockLocations.homeLocation._id );
        expect( data ).to.have.property( 'name' ).eql( mockLocations.homeLocation.name );
        expect( data ).to.have.property( 'address' ).eql( mockLocations.homeLocation.address );
      } );
    } );

    it( 'does not return the location if it exists for a different user', function( done ) {
      return locations.getLocationForUser( mockUsers.testUserId2, mockLocations.homeLocation._id )
      .catch( function() {
        done();
      } );
    } );
  } );

  describe( '.updateLocationForUser', function() {
    it( 'returns the updated location', function() {
      const newParams = { name: 'updateLocationForUsertest', address: '321 updateLocationForUser' };
      return locations.updateLocationForUser( mockUsers.testUserId, mockLocations.homeLocation._id, newParams )
      .then( function( data ) {
        expect( data ).to.have.property( 'name' ).eql( newParams.name );
        expect( data ).to.have.property( 'address' ).eql( newParams.address );
      } );
    } );

    it( 'updates the location in the database', function() {
      const newParams = { name: 'updateLocationForUsertest', address: '321 updateLocationForUser' };
      return locations.updateLocationForUser( mockUsers.testUserId, mockLocations.homeLocation._id, newParams )
      .then( () => locations.getLocationForUser( mockUsers.testUserId, mockLocations.homeLocation._id ) )
      .then( function( data ) {
        expect( data ).to.have.property( 'name' ).eql( newParams.name );
        expect( data ).to.have.property( 'address' ).eql( newParams.address );
      } );
    } );

    it( 'does not update the location if the location belongs to another user', function( done ) {
      const newParams = { name: 'updateLocationForUsertest', address: '321 updateLocationForUser' };
      return locations.updateLocationForUser( mockUsers.testUserId2, mockLocations.homeLocation._id, newParams )
      .catch( function() {
        done();
      } );
    } );

    it( 'does not update the location _id when updating', function() {
      const newParams = { _id: 'foobar', name: 'updateLocationForUsertest', address: '321 updateLocationForUser' };
      return locations.updateLocationForUser( mockUsers.testUserId, mockLocations.homeLocation._id, newParams )
      .then( function( data ) {
        expect( data ).to.have.property( '_id' ).eql( mockLocations.homeLocation._id );
      } );
    } );

    it( 'does not add non-whitelisted parameters when updating', function() {
      const newParams = { games: 'foobar', name: 'updateLocationForUsertest', address: '321 updateLocationForUser' };
      return locations.updateLocationForUser( mockUsers.testUserId, mockLocations.homeLocation._id, newParams )
      .then( function( data ) {
        expect( data ).to.not.have.property( 'games' );
      } );
    } );
  } );

  describe( '.updateLocationListForUser', function() {
    it( 'returns re-ordered locations', function() {
      const ids = [ mockLocations.foodLocation._id, mockLocations.teaLocation._id, mockLocations.workLocation._id ];
      expect( locations.updateLocationListForUser( mockUsers.testUserId2, ids ) ).to.eventually.eql( ids );
    } );

    it( 're-orders existing locations', function( done ) {
      const ids = [ mockLocations.foodLocation._id, mockLocations.teaLocation._id, mockLocations.workLocation._id ];
      locations.updateLocationListForUser( mockUsers.testUserId2, ids )
      .then( () => locations.listLocationsForUser( mockUsers.testUserId2 ) )
      .then( function( data ) {
        const newIds = data.map( loc => loc._id );
        if ( newIds.toString() === ids.toString() ) return done();
        done( `locations were not re-ordered; expected ${ids.toString()}, got ${newIds.toString()}` );
      } );
    } );

    it( 'does not re-order collection if params include a duplicate location ID', function() {
      const ids = [ mockLocations.foodLocation._id, mockLocations.foodLocation._id, mockLocations.workLocation._id ];
      const oldIds = [ mockLocations.workLocation._id, mockLocations.foodLocation._id, mockLocations.teaLocation._id ];
      expect( locations.updateLocationListForUser( mockUsers.testUserId2, ids ) ).to.eventually.eql( oldIds );
    } );

    it( 'does not re-order collection if params do not include all location IDs', function() {
      const ids = [ mockLocations.foodLocation._id, mockLocations.workLocation._id ];
      const oldIds = [ mockLocations.workLocation._id, mockLocations.foodLocation._id, mockLocations.teaLocation._id ];
      expect( locations.updateLocationListForUser( mockUsers.testUserId2, ids ) ).to.eventually.eql( oldIds );
    } );

    it( 'does not re-order collection if params include a location ID for another user', function() {
      const ids = [ mockLocations.teaLocation._id, mockLocations.foodLocation._id, mockLocations.homeLocation._id ];
      const oldIds = [ mockLocations.workLocation._id, mockLocations.foodLocation._id, mockLocations.teaLocation._id ];
      expect( locations.updateLocationListForUser( mockUsers.testUserId2, ids ) ).to.eventually.eql( oldIds );
    } );
  } );
} );
