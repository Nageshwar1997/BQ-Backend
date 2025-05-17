import { model } from "mongoose";

import { Schemas, Types } from "..";

export const User = model<Types.UserProps>("User", Schemas.UserSchema);
