import wiki from 'wikijs';
import cheerio from 'cheerio';
import fs from 'fs';

export type WikiAlbum = {
    title: string
    release: string
}

export type WikiPage = {
    title: string
    pageid: number
    touched: string // date
}

export type WikiDiscography = {
    pageDetails: WikiPage
    musicBrainzUrl?: string
    albums: Record<string, WikiAlbum>
}

export type WikiResult = {
    message: string
    data?: WikiDiscography
}

export default class WikiPedia {
  private wikiClient: ReturnType<typeof wiki>;

  constructor() {
    this.wikiClient = wiki({
      apiUrl: 'https://en.wikipedia.org/w/api.php',
    });
  }

  /**
   * Search an artist's discography in Wikipedia, scraping the HTML content.
   * @param {string} artist The artist name
   * @returns Promise<WikiResult>
   */
  async searchDiscoGraphy(artist: string): Promise<WikiResult> {
    const page = await this.wikiClient.find(artist);
    if (!page) {
      return {
        message: `No artist found for ${artist}`,
      };
    }

    const { pageid, title, touched } = page.raw;
    const content = await page.html();

    const $ = cheerio.load(content);
    const table = $('#Studio_albums').parent().next('table');
    const albums: any = {};

    $(table).each((index, element) => {
      $(element).find('th[scope="row"]').each((i, el) => {
        const a = $(el).find('a');
        const wikiPage: string = a.attr('href')!;
        const albumName = a.text();

        const details = $(el).siblings('td').find('li').first();
        const released = details.text().replace(/released: /i, '');

        albums[wikiPage] = {
          title: albumName,
          released,
        };
      });
    });

    const musicBrainzUrl = $('a[href*="musicbrainz.org"]').attr('href');
    return {
      message: 'OK',
      data: {
        pageDetails: { pageid, title, touched },
        albums,
        musicBrainzUrl,
      },
    };
  }

  /**
   * Save a page into a file.
   * @param {string} fileName File name
   * @param {string} content Data to be written inside the file.
   * @returns {Promise<void>}
   */
  private static saveHTML(fileName: string, content: string): Promise<void> {
    return fs.promises.writeFile(fileName, content);
  }
}
