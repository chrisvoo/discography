import fs from 'fs';
import 'jest-extended';
import WPClient from '../src/provider/WikiPediaToSql';
// import { showResult } from '../src/utils/terminal';

describe('WikiPediaToSql', () => {
  const wpClient = new WPClient();

  it('SQL', async () => {
    const artist = 'AC/DC';
		const bandId = 1;
		const firstAlbumPk = 1;
    await wpClient.searchAll(artist, bandId, firstAlbumPk);
  }, 50000);
});
