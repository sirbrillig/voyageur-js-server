import mongoose from 'mongoose';
import { Promise } from 'es6-promise';
mongoose.Promise = Promise;

const Schema = mongoose.Schema;

export default mongoose.model( 'Location', new Schema( {
  userId: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
} ) );
