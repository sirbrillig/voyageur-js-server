import { Promise } from 'es6-promise';
import Log from '../../models/log';

export function getAllEvents() {
  return new Promise( ( resolve, reject ) => {
    getAllLogs()
    .then( resolve )
    .catch( reject );
  } );
}

function getAllLogs() {
  return new Promise( ( resolve, reject ) => {
    Log.find( {} )
    .sort( { time: -1 } )
    .limit( 100 )
    .exec( ( err, logs ) => {
      if ( err ) return reject( err );
      return resolve( logs );
    } );
  } )
}
