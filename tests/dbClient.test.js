import dbClient from '../utils/db';

describe('dbClient', () => {
  it('should be connected', () => {
    expect(dbClient.isAlive()).resolves.toBe(true);
  });

  it('should return the database instance', () => {
    expect(dbClient.db).toBeDefined();
  });
});
