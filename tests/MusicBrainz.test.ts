import 'jest-extended';
import MusicBrainz, { Discography } from '../src/provider/MusicBrainz';
import { showResult } from '../src/utils/terminal';

describe('MusicBrainz API', () => {
  const client = new MusicBrainz();

  it('can get artist discography', async () => {
    const result = await client.getArtistDiscography('Rancid', ['Live', 'Compilation']);
    expect('error' in result).toBeFalse();

    const discography = result as Discography;
    const { artist, releaseGroups } = discography;
    expect(artist.id).toBe('24f8d8a5-269b-475c-a1cb-792990b0b2ee');
    expect(artist.lifeSpan.begin).toBe('1991');
    expect(releaseGroups.length >= 10).toBeTrue();
    expect(releaseGroups[0].releaseDate).toBe('1993-05-10');
  });
});
