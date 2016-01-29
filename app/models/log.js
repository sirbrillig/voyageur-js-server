import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default mongoose.model( 'Log', new Schema( {
  userId: { type: String },
  userName: { type: String },
  event: { type: String, required: true },
  level: { type: Number, required: true },
  name: { type: String, required: true },
  path: { type: String },
  ip: { type: String },
  body: { type: Object },
  time: { type: Date, expires: '30d', required: true },
  data: { type: Object },
  msg: { type: String },
  hostname: { type: String },
  pid: { type: String },
  v: { type: String },
  res: { type: Object },
  req: { type: Object },
} ) );

export * from './log/actions';
