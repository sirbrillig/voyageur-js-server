const chai = require( 'chai' );
const chaiAsPromised = require( 'chai-as-promised' );
import * as eventLog from '../app/models/log';
import { connectToDb, disconnectFromDb, resetDb, mockEvents } from './bootstrap';

chai.use( chaiAsPromised );
const expect = chai.expect;

describe( 'log', function() {
  before( function( done ) {
    connectToDb( done );
  } );

  after( function() {
    disconnectFromDb();
  } );

  beforeEach( function( done ) {
    resetDb( done );
  } );

  describe( '.getAllEvents', function() {
    it( 'returns an array with 100 events', function() {
      return eventLog.getAllEvents()
      .then( function( data ) {
        expect( data ).to.have.length( 100 );
      } );
    } );

    it( 'returns an array with the most recent 100 current events', function() {
      return eventLog.getAllEvents()
      .then( function( data ) {
        const actual = data.map( x => x.name );
        const expected = Object.keys( mockEvents )
        .sort( ( a, b ) => mockEvents[ b ].time - mockEvents[ a ].time )
        .slice( 0, 100 )
        .map( x => mockEvents[ x ].name );
        expect( actual ).to.eql( expected );
      } );
    } );

    it( 'returns an array with 100 events if a page is passed', function() {
      return eventLog.getAllEvents( { page: 1 } )
      .then( function( data ) {
        expect( data ).to.have.length( 100 );
      } );
    } );

    it( 'returns paginated data if a page is passed', function() {
      return eventLog.getAllEvents( { page: 1 } )
      .then( function( data ) {
        const actual = data.map( x => x.name );
        const expected = Object.keys( mockEvents )
        .sort( ( a, b ) => mockEvents[ b ].time - mockEvents[ a ].time )
        .slice( 100, 200 )
        .map( x => mockEvents[ x ].name );
        expect( actual ).to.eql( expected );
      } );
    } );
  } );
} );
