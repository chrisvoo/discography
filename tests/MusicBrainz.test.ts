import { MusicBrainz } from '../src/provider/MusicBrainz';
import { Discography, Track, ArtistDetails } from '../src/provider/types/MusicBrainzTypes';
import { showResult } from '../src/utils/terminal';

describe('MusicBrainz API', () => {
  const client = new MusicBrainz();

  it('can get artist discography', async () => {
    const result = await client.getArtistDiscography('Rancid', ['Live', 'Compilation', 'Single']);
    expect('error' in result).toBe(false);

    const discography = result as Discography;
    const { artist, releaseGroups } = discography;
    expect(artist.id).toBe('24f8d8a5-269b-475c-a1cb-792990b0b2ee');
    expect(artist.lifeSpan.begin).toBe('1991');
    expect(releaseGroups.length >= 10).toBe(true);
    expect(releaseGroups[0].releaseDate).toBe('1993-05-10');
  });

  it('can get the tracks of a release group', async () => {
    const letsGoAlbumId = '37c2647f-8e58-3839-a6b6-374c9ee88b1d';
    const result = await client.getTracksByReleaseGroup(letsGoAlbumId);
    expect('error' in result).toBe(false);

    const tracks = result as Track[];
    const {
      id, length, title, position,
    } = tracks[0];
    expect(id).toBe('bfd6a742-7f73-399d-956b-3617c4bc1f02');
    expect(length).toBe(123440);
    expect(title).toBe('Nihilism');
    expect(position).toBe(1);
  });

  it.only('can get artist\'s info', async () => {
    const result = await client.getArtist('Bon Scott');
    expect(result).not.toBeNull();
    expect('error' in result!).toBe(false);

    const artist = result as ArtistDetails;
    expect(artist.id).toBe('0d212894-db54-4cc1-9ded-3cac50183a1d');
    expect(artist.name).toBe('Bon Scott');
    expect(artist.country).toBe('GB');
    expect(artist.lifeSpan.begin).toBe('1946-07-09');
    expect(artist.lifeSpan.ended).toBe('1980-02-19');
  });
});
