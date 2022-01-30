import fs from 'fs';
import 'jest-extended';
import WPClient from '../src/provider/WikiPediaToSql';
// import { showResult } from '../src/utils/terminal';

describe('WikiPediaToSql', () => {
  const wpClient = new WPClient();

  it('SQL', async () => {
    const artist = 'AC/DC';
    await wpClient.searchAll(artist, 1, 1);
  }, 50000);
});
