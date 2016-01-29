import express from 'express';
import locations from './routes/locations';
import tripLocations from './routes/trip-locations';
import distances from './routes/distances';
import admin from './routes/admin';

const router = express.Router();

router.route( '/secured/locations' )
.get( locations.list )
.post( locations.create )
.put( locations.updateList );

router.route( '/secured/locations/:locationId' )
.get( locations.get )
.put( locations.update )
.delete( locations.delete );

router.route( '/secured/trip-locations' )
.get( tripLocations.list )
.delete( tripLocations.deleteAll )
.post( tripLocations.create )
.put( tripLocations.updateList );

router.route( '/secured/trip-locations/:tripLocationId' )
.get( tripLocations.get )
.delete( tripLocations.delete );

router.route( '/secured/distance' )
.get( distances.get );

router.route( '/admin/events' )
.get( admin.get );

export default router;
