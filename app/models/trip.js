import mongoose from 'mongoose';
import findOrCreate from 'mongoose-findorcreate';

const Schema = mongoose.Schema;

const TripSchema = new Schema( {
  userId: { type: String, required: true },
  tripLocations: [ { type: mongoose.Schema.Types.ObjectId, ref: 'TripLocation' } ],
} );

TripSchema.plugin( findOrCreate );

export default mongoose.model( 'Trip', TripSchema );

