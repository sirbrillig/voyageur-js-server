import times from 'lodash.times';
import mongoose from 'mongoose';
import { Promise } from 'es6-promise';
mongoose.Promise = Promise;
import mockgoose from 'mockgoose';

if ( ! mongoose.isMocked ) {
  mockgoose( mongoose );
}
import Location from '../app/models/location';
import LocationCollection from '../app/models/location-collection';
import Trip from '../app/models/trip';
import Distance from '../app/models/distance';
import Log from '../app/models/log';

export const mockUsers = {
  testUserId: 'testUser',
  testUserId2: 'testUser2',
};

export const models = {
  Location,
  LocationCollection,
  Trip,
  Distance
};

export const mockEvents = {};
export const mockLocations = {};
export const mockDistances = {};
export const mockLocationCollections = {};
export const mockTrips = {};

function populateUser1() {
  mockLocations.homeLocation = new Location( { userId: mockUsers.testUserId, name: 'foo', address: '123 home drive' } );
  mockLocations.coffeeLocation = new Location( { userId: mockUsers.testUserId, name: 'coffee', address: '123 coffee place' } );
  mockLocations.beachLocation = new Location( { userId: mockUsers.testUserId, name: 'beach', address: '123 beach place' } );
  mockLocations.gameLocation = new Location( { userId: mockUsers.testUserId, name: 'games', address: 'funplace' } );

  mockDistances.homeCoffeeDistance = new Distance( { userId: mockUsers.testUserId, origin: mockLocations.homeLocation, destination: mockLocations.coffeeLocation, distance: 600 } );
  mockDistances.coffeeBeachDistance = new Distance( { userId: mockUsers.testUserId, origin: mockLocations.coffeeLocation, destination: mockLocations.beachLocation, distance: 400 } );
  const oldDate = new Date( ( new Date() ).valueOf() - 1000 * 60 * 60 * 24 * 7 );
  mockDistances.beachHomeDistance = new Distance( { userId: mockUsers.testUserId, origin: mockLocations.beachLocation, destination: mockLocations.homeLocation, distance: 400, cachedAt: oldDate } );

  mockTrips.testUserTrip = new Trip( { userId: mockUsers.testUserId, tripLocations: [ mockLocations.homeLocation._id, mockLocations.coffeeLocation._id, mockLocations.beachLocation._id ] } );

  mockLocationCollections.testUserLocationCollection = new LocationCollection( { userId: mockUsers.testUserId, locations: [ mockLocations.homeLocation._id ] } );
}

function populateUser2() {
  mockLocations.foodLocation = new Location( { userId: mockUsers.testUserId2, name: 'food', address: 'foodplace' } );
  mockLocations.teaLocation = new Location( { userId: mockUsers.testUserId2, name: 'tea', address: 'teaplace' } );
  mockLocations.workLocation = new Location( { userId: mockUsers.testUserId2, name: 'work', address: 'workplace' } );

  mockDistances.teaFoodDistance = new Distance( { userId: mockUsers.testUserId2, origin: mockLocations.teaLocation, destination: mockLocations.foodLocation, distance: 2000 } );

  mockTrips.testUserTrip2 = new Trip( { userId: mockUsers.testUserId2, tripLocations: [ mockLocations.teaLocation._id, mockLocations.foodLocation._id ] } );

  mockLocationCollections.testUser2LocationCollection = new LocationCollection( { userId: mockUsers.testUserId2, locations: [ mockLocations.workLocation._id, mockLocations.foodLocation._id, mockLocations.teaLocation._id ] } );
}

function populateEvents() {
  times( 200, i => {
    mockEvents[ `event-${i}` ] = new Log( { userId: mockUsers.testUserId2, time: i, name: `test-event-${i}`, event: 'get', level: 1, data: { userId: mockUsers.testUserId2 } } );
  } );
}

export function populateDb( done ) {
  populateUser1();
  populateUser2();
  populateEvents();

  saveAllOf( mockLocations )
  .then( saveAllOf( mockDistances ) )
  .then( saveAllOf( mockLocationCollections ) )
  .then( saveAllOf( mockTrips ) )
  .then( saveAllOf( mockEvents ) )
  .then( () => done() )
  .then( null, ( err ) => done( err ) );
}

function saveAllOf( objs ) {
  return Promise.all( Object.keys( objs ).map( l => objs[ l ].save() ) );
}

export function connectToDb( done ) {
  mongoose.connect( 'mongodb://example.localhost/TestingDB', function( err ) {
    if ( err ) return done( err );
    done();
  } );
}

export function disconnectFromDb() {
  mongoose.disconnect();
}

export function resetDb( done ) {
  mockgoose.reset( () => populateDb( done ) );
}
