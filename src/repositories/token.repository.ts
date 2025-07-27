import { Types } from "mongoose";

import { IToken } from "../interfaces/token.interface";
import { Token } from "../models/token.model";

class TokenRepository {
  public async create(dto: Partial<IToken>): Promise<IToken> {
    return await Token.create(dto);
  }

  public async findByParams(params: Partial<IToken>): Promise<IToken> {
    return await Token.findOne(params);
  }

  public async deleteOneByParams(params: Partial<IToken>): Promise<void> {
    await Token.deleteOne(params);
  }

  public async deleteSignByAccessToken(accessToken: string): Promise<void> {
    await Token.deleteOne({ accessToken });
  }

  public async deleteAllSignsByUserId(
    userId: Types.ObjectId | string
  ): Promise<void> {
    await Token.deleteMany({ _userId: userId });
  }

  public async deleteAllByParams(params: Partial<IToken>): Promise<void> {
    await Token.deleteMany(params);
  }

  public async deleteBeforeDate(date: Date): Promise<number> {
    const result = await Token.deleteMany({ createdAt: { $lt: date } });
    return result.deletedCount;
  }
}

export const tokenRepository = new TokenRepository();
