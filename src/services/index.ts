import { classes } from "../classes";

export const services = {
  mail: new classes.Mail(),
  redis: new classes.Redis(),
};
