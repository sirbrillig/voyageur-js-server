import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default mongoose.model( 'TripLocation', new Schema( {
  userId: { type: String, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
} ) );

