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
    it( 'returns an array with all current events', function() {
      return eventLog.getAllEvents()
      .then( function( data ) {
        const actual = data.map( x => x.name );
        const expected = Object.keys( mockEvents ).map( x => mockEvents[ x ].name );
        expect( actual ).to.eql( expected );
      } );
    } );
  } );
} );
