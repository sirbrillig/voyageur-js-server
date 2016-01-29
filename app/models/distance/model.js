import mongoose from 'mongoose';

const DistanceSchema = new mongoose.Schema( {
  userId: { type: String, required: true },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  distance: { type: Number, required: true },
  cachedAt: { type: Date, default: Date.now, required: true },
} );

export default mongoose.model( 'Distance', DistanceSchema );
