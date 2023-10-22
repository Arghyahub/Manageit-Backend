import mongoose, { Model, Schema } from "mongoose";
import { IOrganisation } from "../types";

const orgSchema: Schema<IOrganisation> = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwd: { type: String, required: true },
    role: { type: String, required: true, default: "owner" },
    projects: [{ _id: false, projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true }, name: { type: String, required: true } }],
    users: [{ _id: false, userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, name: { type: String, required: true } }]
})

const Organisation: Model<IOrganisation> = mongoose.model('Organisation', orgSchema);

export default Organisation;
