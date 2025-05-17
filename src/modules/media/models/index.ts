import { model } from "mongoose";

import { Schemas, Types } from "..";

export const HomeVideo = model<Types.HomeVideoProps>(
  "HomeVideo",
  Schemas.HomeVideoSchema
);
