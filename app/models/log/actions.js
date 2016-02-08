import { Promise } from 'es6-promise';
import Log from '../../models/log';

export function getAllEvents( opts ) {
  return getAllLogs( opts );
}

function getAllLogs( opts = {} ) {
  const limitPerPage = opts.limit || 100;
  const page = opts.page || 0;
  return new Promise( ( resolve, reject ) => {
    Log.find( {} )
    .sort( { time: -1 } )
    .skip( limitPerPage * page )
    .limit( limitPerPage )
    .exec( ( err, logs ) => {
      if ( err ) return reject( err );
      return resolve( logs );
    } );
  } )
}
