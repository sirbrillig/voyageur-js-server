import mongoose from 'mongoose';
import { Promise } from 'es6-promise';
mongoose.Promise = Promise;

const Schema = mongoose.Schema;

export default mongoose.model( 'TripLocation', new Schema( {
  userId: { type: String, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
} ) );

