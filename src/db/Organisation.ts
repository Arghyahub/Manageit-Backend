import mongoose, { Model, Schema } from "mongoose";
import { IOrganisation } from "../types";

const orgSchema: Schema<IOrganisation> = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwd: { type: String, required: true },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

const Organisation: Model<IOrganisation> = mongoose.model('Organisation', orgSchema);

export default Organisation;
