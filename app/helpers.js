import { Promise } from 'es6-promise';
import distance from 'google-distance';
import dotenv from 'dotenv';
import logStream from 'bunyan-mongodb-stream';
import bunyan from 'bunyan';
import Log from './models/log';

dotenv.load();

distance.apiKey = process.env.GOOGLE_DISTANCE_API_KEY;

export function getUserIdFromRequest( req ) {
  if ( ! req.user ) return '';
  return req.user.sub;
}

export function getUserNameFromRequest( req ) {
  if ( ! req.user ) return '';
  return req.user.name || req.user.nickname || req.user.email || req.user.user_id;
}

export function removeElementFromArray( ary, element ) {
  return ary.reduce( ( collection, el ) => {
    if ( el !== element ) collection.push( el );
    return collection;
  }, [] );
}

export function fetchDistanceBetween( origin, destination ) {
  return new Promise( ( resolve, reject ) => {
    distance.get( { origin, destination }, ( err, data ) => {
      if ( err ) return reject( err );
      resolve( data.distanceValue );
    } );
  } );
}

export function logFactory() {
  const LogEntryStream = logStream( { model: Log } );
  const log = bunyan.createLogger( {
    name: 'voyageur-server',
    streams: [
      { stream: process.stdout },
      { stream: LogEntryStream },
    ],
    serializers: bunyan.stdSerializers
  } );

  return function( req, res, next ) {
    const { method, path, ip, body } = req;
    const userId = getUserIdFromRequest( req );
    const userName = getUserNameFromRequest( req );
    const logEntry = { userId, userName, path, ip, event: method, body };
    log.info( logEntry );
    req.log = ( data, msg ) => log.info( Object.assign( {}, logEntry, data ), msg );
    req.error = ( data, msg ) => log.error( Object.assign( {}, logEntry, data ), msg );
    next();
  }
}
