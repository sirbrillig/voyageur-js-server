import mongoose from 'mongoose';
import findOrCreate from 'mongoose-findorcreate';

const Schema = mongoose.Schema;

const LocationCollectionSchema = new Schema( {
  userId: { type: String, required: true },
  locations: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Location' } ],
} );

LocationCollectionSchema.plugin( findOrCreate );

export default mongoose.model( 'LocationCollection', LocationCollectionSchema );
