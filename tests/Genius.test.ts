import { Genius } from '../src/provider/Genius';
import { Lyrics } from '../src/provider/types/GeniusTypes';
import { showResult } from '../src/utils/terminal';

describe('Genius API', () => {
  it.only('can retrieve the lyrics of a song', async () => {
    const client = new Genius();
    const lyrics: Lyrics = await client.getLyrics('Rancid', 'Nihilism') as Lyrics;
    expect(lyrics.id).toBe(1702216);
    expect(lyrics.artistId).toBe(30419);
    expect(lyrics.lyrics.toLowerCase().includes('if you try really hard')).toBe(true);
  });
});
