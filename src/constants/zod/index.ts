export const singleSpaceRegex = /^(?!.*\s{2,}).*$/;

export const noSpaceRegex = /^\S+$/;

export const hexColorRegex =
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const dateRegex =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|([+-]\d{2}:\d{2}))?)?$/;

export const nameRegex = /^(?!.*\d)(?!.* {2})([A-Za-z]+( [A-Za-z]+)*)$/;

export const phoneRegex = /^[6-9][0-9]{9}$/;

export const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])(?=\S.*$).{6,20}$/;

export const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
