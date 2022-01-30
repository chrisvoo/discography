import mom from 'moment';
import * as WT from './types/WikiPediaTypes';
import WikiPedia from './WikiPedia';

/**
 * Utility class to populate some RBDMS tables that define albums and songs of a band.
 */
export default class WikiPediaToSql extends WikiPedia {
  async searchAll(artist: string, bandId: number, firstAlbumPk: number): Promise<void> {
    const result: WT.WikiDiscographyResult = await this.searchDiscoGraphy(artist);
    const sqlContent: string[] = ['INSERT INTO albums (id, title, band_id, released_on)\nVALUES'];

    const albumReferences: WT.WikiAlbumReference[] = [];

    if (result.data?.albums !== undefined) {
      const albums: WT.AlbumItem[] = result.data?.albums;
      for (let index = 0, albumKey = firstAlbumPk; index < albums.length; albumKey++, index++) {
        const { wikiPage, album } = albums[index];
        const { released, title } = album;

        albumReferences.push({
          albumPk: albumKey,
          wikiPage,
        });

        const releasedOn = released ? mom(released, 'D MMMM YYYY').format('YYYY-MM-DD') : null;
        sqlContent.push(`(${albumKey}, "${title}", ${bandId}, "${releasedOn}"),`);
      }

      sqlContent[sqlContent.length - 1] = sqlContent[sqlContent.length - 1].slice(0, -1);
      sqlContent.push('\n');
      sqlContent.push('INSERT INTO songs (title, track_number, side, album_id)\nVALUES');

      const { albumPk, wikiPage } = albumReferences[0];
      const tracksData: WT.WikiTrackResult = await this.searchTracks(wikiPage.replace(/\/wiki\//, ''));

      if (tracksData.data?.tracks) {
        tracksData.data.tracks.forEach((track: WT.WikiTrack) => {
          sqlContent.push(`("${track.title}", ${track.num}, ${track.side}, ${albumPk}),`);
        });
        console.log(`${sqlContent.join('\n').slice(0, -1)};`);
      } else if (tracksData.message) {
        console.log(`${wikiPage.replace(/\/wiki\//, '')}: ${tracksData.message}`);
      }
    }
  }
}
