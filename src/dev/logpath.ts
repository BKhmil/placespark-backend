import { NextFunction, Request, Response } from "express";

export const logpath = (req: Request, res: Response, next: NextFunction) => {
  console.log(
    "\nTRIGGERED PATH => " +
      req.originalUrl +
      "\n" +
      "METHOD => " +
      req.method +
      "\n"
  );
  next();
};
