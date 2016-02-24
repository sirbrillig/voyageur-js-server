import mongoose from 'mongoose';
import { Promise } from 'es6-promise';
mongoose.Promise = Promise;
import findOrCreate from 'mongoose-findorcreate';

const Schema = mongoose.Schema;
const getDefaultDate = () => new Date( ( new Date() ).valueOf() - 1000 * 60 * 60 ).getTime();

const TripSchema = new Schema( {
  userId: { type: String, required: true },
  lastUpdated: { type: Date, default: getDefaultDate, required: true },
  tripLocations: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Location' } ],
} );

TripSchema.plugin( findOrCreate );

export default mongoose.model( 'Trip', TripSchema );

