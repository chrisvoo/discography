import fs from 'fs';
import 'jest-extended';
import WPClient from '../src/provider/WikiPedia';
import { showResult } from '../src/utils/terminal';
// import { showResult } from '../src/utils/terminal';

describe('WikiPedia API', () => {
  const wpClient = new WPClient();

  const fileExists = (path: string) => new Promise((resolve, reject) => {
    try {
      fs.promises.access(path).then(() => resolve(true));
    } catch (e) {
      reject(e.message);
    }
  });

  it('can find the discography of a group', async () => {
    const artist = 'The Offspring';
    const discography = await wpClient.searchDiscoGraphy(artist, {
      saveHtml: true,
    });

    const { albums, pageDetails } = discography.data!;

    expect(fileExists(`${artist}.html`)).resolves.toBeTrue();
    expect(pageDetails.pageid).toEqual(8426694);
    expect(Object.keys(albums).length >= 10).toBeTrue();
    expect(Object.keys(albums).includes('Ixnay_on_the_Hombre'));

    await fs.promises.unlink(`${artist}.html`);
  });

  it.only('can find the tracks of an album (1 table case)', async () => {
    const album = 'Smash_(The_Offspring_album)';
    const albumDetails = await wpClient.searchTracks(album);

    expect(albumDetails.data).not.toBeUndefined();
    expect(albumDetails?.data?.pageDetails?.pageid).toBe(172936);
    expect(albumDetails?.data?.tracks?.length).toBe(14);

    const track = albumDetails?.data?.tracks?.filter((t) => t.num === 7)[0];
    expect(track).not.toBeUndefined();
    expect(track?.title).toBe('Come Out and Play');
    expect(track?.length).toBe(197);
  });

  it('can find the tracks of an album (multiple formats, CD/cassette)', async () => {
    const album = 'The_Offspring_(album)';
    const albumDetails = await wpClient.searchTracks(album);

    expect(albumDetails.data).not.toBeUndefined();
    expect(albumDetails?.data?.pageDetails?.pageid).toBe(162338);
    expect(albumDetails?.data?.tracks?.length).toBe(12);

    const track = albumDetails?.data?.tracks?.filter((t) => t.num === 9)[0];
    expect(track).not.toBeUndefined();
    expect(track?.title).toBe('Blackball');
    expect(track?.length).toBe(204);
  });
});
