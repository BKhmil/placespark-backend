import { IActionToken } from "../interfaces/action-token.interface";
import { ActionToken } from "../models/action-token.model";

class ActionTokenRepository {
  public async create(dto: Partial<IActionToken>): Promise<IActionToken> {
    return await ActionToken.create(dto);
  }

  public async findOneByParams(
    params: Partial<IActionToken>
  ): Promise<IActionToken> {
    return await ActionToken.findOne(params);
  }

  public async deleteOneByParams(params: Partial<IActionToken>): Promise<void> {
    await ActionToken.deleteOne(params);
  }

  public async getByToken(token: string): Promise<IActionToken | null> {
    return await ActionToken.findOne({ token });
  }

  public async deleteManyByParams(
    params: Partial<IActionToken>
  ): Promise<void> {
    await ActionToken.deleteMany(params);
  }

  public async deleteBeforeDate(date: Date): Promise<number> {
    const result = await ActionToken.deleteMany({ createdAt: { $lt: date } });
    return result.deletedCount;
  }
}

export const actionTokenRepository = new ActionTokenRepository();
