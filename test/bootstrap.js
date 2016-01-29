import mongoose from 'mongoose';
import { Promise } from 'es6-promise';
mongoose.Promise = Promise;
import mockgoose from 'mockgoose';

if ( ! mongoose.isMocked ) {
  mockgoose( mongoose );
}
import Location from '../app/models/location';
import LocationCollection from '../app/models/location-collection';
import TripLocation from '../app/models/trip-location';
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
  TripLocation,
  Trip,
  Distance
};

export const mockEvents = {};
export const mockLocations = {};
export const mockDistances = {};
export const mockTripLocations = {};
export const mockLocationCollections = {};
export const mockTrips = {};

function populateUser1() {
  mockLocations.homeLocation = new Location( { userId: mockUsers.testUserId, name: 'foo', address: '123 home drive' } );
  mockLocations.coffeeLocation = new Location( { userId: mockUsers.testUserId, name: 'coffee', address: '123 coffee place' } );
  mockLocations.beachLocation = new Location( { userId: mockUsers.testUserId, name: 'beach', address: '123 beach place' } );
  mockLocations.gameLocation = new Location( { userId: mockUsers.testUserId, name: 'games', address: 'funplace' } );

  mockTripLocations.homeTripLocation = new TripLocation( { userId: mockUsers.testUserId, location: mockLocations.homeLocation } );
  mockTripLocations.coffeeTripLocation = new TripLocation( { userId: mockUsers.testUserId, location: mockLocations.coffeeLocation } );
  mockTripLocations.beachTripLocation = new TripLocation( { userId: mockUsers.testUserId, location: mockLocations.beachLocation } );

  mockDistances.homeCoffeeDistance = new Distance( { userId: mockUsers.testUserId, origin: mockLocations.homeLocation, destination: mockLocations.coffeeLocation, distance: 600 } );
  mockDistances.coffeeBeachDistance = new Distance( { userId: mockUsers.testUserId, origin: mockLocations.coffeeLocation, destination: mockLocations.beachLocation, distance: 400 } );
  const oldDate = new Date( ( new Date() ).valueOf() - 1000 * 60 * 60 * 24 * 7 );
  mockDistances.beachHomeDistance = new Distance( { userId: mockUsers.testUserId, origin: mockLocations.beachLocation, destination: mockLocations.homeLocation, distance: 400, cachedAt: oldDate } );

  mockTrips.testUserTrip = new Trip( { userId: mockUsers.testUserId, tripLocations: [ mockTripLocations.homeTripLocation, mockTripLocations.coffeeTripLocation, mockTripLocations.beachTripLocation ] } );

  mockLocationCollections.testUserLocationCollection = new LocationCollection( { userId: mockUsers.testUserId, locations: [ mockLocations.homeLocation ] } );
}

function populateUser2() {
  mockLocations.foodLocation = new Location( { userId: mockUsers.testUserId2, name: 'food', address: 'foodplace' } );
  mockLocations.teaLocation = new Location( { userId: mockUsers.testUserId2, name: 'tea', address: 'teaplace' } );
  mockLocations.workLocation = new Location( { userId: mockUsers.testUserId2, name: 'work', address: 'workplace' } );

  mockTripLocations.teaTripLocation = new TripLocation( { userId: mockUsers.testUserId2, location: mockLocations.teaLocation } );
  mockTripLocations.foodTripLocation = new TripLocation( { userId: mockUsers.testUserId2, location: mockLocations.foodLocation } );

  mockDistances.teaFoodDistance = new Distance( { userId: mockUsers.testUserId2, origin: mockLocations.teaLocation, destination: mockLocations.foodLocation, distance: 2000 } );

  mockTrips.testUserTrip2 = new Trip( { userId: mockUsers.testUserId2, tripLocations: [ mockTripLocations.teaTripLocation, mockTripLocations.foodTripLocation ] } );

  mockLocationCollections.testUser2LocationCollection = new LocationCollection( { userId: mockUsers.testUserId2, locations: [ mockLocations.workLocation, mockLocations.foodLocation, mockLocations.teaLocation ] } );
}

function populateEvents() {
  mockEvents.firstEvent = new Log( { userId: mockUsers.testUserId2, time: Date.now(), name: 'test', event: 'get', level: 1, data: { userId: mockUsers.testUserId2 } } );
}

export function populateDb( done ) {
  populateUser1();
  populateUser2();
  populateEvents();

  saveAllOf( mockLocations )
  .then( saveAllOf( mockDistances ) )
  .then( saveAllOf( mockTripLocations ) )
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
