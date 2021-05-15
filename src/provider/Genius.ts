import { Client, Song } from 'genius-lyrics';

export type Lyrics = {
  id: number
  artistId: number
  title: string
  lyrics: string
}

/*
{
  annotation_count: 13,
  api_path: '/songs/3828261',
  full_title: 'CUTTHROAT SMILE by BEXEY (Ft. $UICIDEBOY$)',
  header_image_thumbnail_url: 'https://images.genius.com/e62938e45022aec0e52a945707693309.300x300x1.jpg',
  header_image_url: 'https://images.genius.com/e62938e45022aec0e52a945707693309.1000x1000x1.jpg',
  id: 3828261,
  lyrics_owner_id: 4062525,
  lyrics_state: 'complete',
  path: '/Bexey-cutthroat-smile-lyrics',
  pyongs_count: 14,
  song_art_image_thumbnail_url: 'https://images.genius.com/e62938e45022aec0e52a945707693309.300x300x1.jpg',
  song_art_image_url: 'https://images.genius.com/e62938e45022aec0e52a945707693309.1000x1000x1.jpg',
  stats: { unreviewed_annotations: 0, hot: false, pageviews: 88285 },
  title: 'CUTTHROAT SMILE',
  title_with_featured: 'CUTTHROAT SMILE (Ft. $UICIDEBOY$)',
  url: 'https://genius.com/Bexey-cutthroat-smile-lyrics',
  song_art_primary_color: '#9a4611',
  song_art_secondary_color: '#653d1c',
  song_art_text_color: '#fff',
  primary_artist: {
    api_path: '/artists/579589',
    header_image_url: 'https://images.genius.com/aa8f07836c853f1ac9e2fd74243f160f.480x270x21.gif',
    id: 579589,
    image_url: 'https://images.genius.com/a2e6a152588c51ca43a77bf81d006b7f.1000x1000x1.jpg',
    is_meme_verified: false,
    is_verified: true,
    name: 'BEXEY',
    url: 'https://genius.com/artists/Bexey',
    iq: 456
  }
}
*/

/**
 * Consumes Genius API through a third-party client.
 */
export default class Genius {
    private client: Client;

    /**
     * Create an instance of a Genius client. If an access token isn't provided,
     * it scrapes the website.
     */
    constructor() {
      this.client = new Client(process.env.GENIUS_CLIENT_ACCESS_TOKEN);
    }

    /**
     * It uses the artist's name to pick the right song among the multiple
     * songs returned by the request.
     * @param {string} primary_artist Artist's name.
     * @param {string} song The song's name.
     * @returns {Lyrics} A lyrics object which contains the lyrics.
     */
    async getLyrics(primary_artist: string, song: string): Promise<Lyrics | null> {
      const songs: Song[] = await this.client.songs.search(song);
      for (let i = 0; i < songs.length; i++) {
        const { artist, id, featuredTitle } = songs[i];
        if (artist.name.trim().toLowerCase().includes(primary_artist.trim().toLowerCase())) {
          const artistId = artist.id;

          return {
            id,
            artistId,
            title: featuredTitle,
            // eslint-disable-next-line no-await-in-loop
            lyrics: await songs[i].lyrics(),
          };
        }
      }

      return null;
    }
}
