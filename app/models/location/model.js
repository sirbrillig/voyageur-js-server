import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default mongoose.model( 'Location', new Schema( {
  userId: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
} ) );
