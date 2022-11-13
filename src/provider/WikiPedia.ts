import wiki from 'wikijs';
import pretty from 'pretty';
import cheerio from 'cheerio';
import fs from 'fs';
import * as WT from './types/WikiPediaTypes';

export class WikiPedia {
  protected wikiClient: ReturnType<typeof wiki>;

  constructor() {
    this.wikiClient = wiki({
      apiUrl: 'https://en.wikipedia.org/w/api.php',
    });
  }

  /**
   * Search an artist's discography in Wikipedia, scraping the HTML content.
   * @param {string} artist The artist name
   * @param {boolean} saveHtml If to save the HTML code to a file, useful for debugging.
   * @returns Promise<WikiResult>
   */
  async searchDiscoGraphy(
    artist: string,
    options?: WT.WikiPageOptions,
  ): Promise<WT.WikiDiscographyResult> {
    const page = await this.wikiClient.find(`${artist} discography`);
    if (!page) {
      return {
        message: `No artist found for ${artist}`,
      };
    }

    let summary: string = '';
    if (options?.summary) {
      summary = await page.summary();
    }

    const { pageid, title, touched } = page.raw;
    const content = await page.html();

    if (options?.saveHtml) {
      const curDir = `${process.cwd()}/${artist}.html`;
      await WikiPedia.saveHTML(curDir, pretty(content));
    }

    const $ = cheerio.load(content);
    const table = $('#Studio_albums').parent().next('table');
    const albums: WT.AlbumItem[] = [];

    $(table).each((index, element) => {
      $(element).find('th[scope="row"]').each((i, el) => {
        const a = $(el).find('a');
        const wikiPage: string = a.attr('href')!;
        const albumName = a.text();

        const details = $(el).siblings('td').find('li').first();
        const released = details.text().replace(/released: /i, '');

        albums.push(
          {
            wikiPage,
            album: {
              title: albumName.replace(/\/wiki\//, ''),
              released,
            },
          },
        );
      });
    });

    let musicBrainzUrl = $('a[href*="musicbrainz.org"]').attr('href');
    if (!musicBrainzUrl?.startsWith('http')) {
      musicBrainzUrl += 'https';
    }

    return {
      message: 'OK',
      data: {
        pageDetails: {
          pageid, title, touched, summary,
        },
        albums,
        musicBrainzUrl,
      },
    };
  }

  /**
   * Removes quotes and unnecessary notes.
   * @param {cheerio.Cheerio} element An element
   * @returns A simpler title.
   */
  private cleanTrackTitle(element: cheerio.Cheerio): string {
    const stripQuotes = (s: string) => s.replace(/"/g, '');

    if (element.find('a').length !== 0) {
      return stripQuotes(element.find('a').text());
    }

    return stripQuotes(element.text());
  }

  /**
   * Convert a textual duration to the one in seconds.
   * @param {string} duration The song duration in the form of m:ss
   * @returns {number} The duration in seconds
   */
  private convertToSeconds(duration: string): number {
    const [minsTemp, secsTemp] = duration.split(':');
    const mins = parseInt(minsTemp, 10);
    const secs = parseInt(secsTemp, 10);

    if (mins === 0) {
      return secs;
    }

    return mins * 60 + secs;
  }

  /**
   * Returns the tracks of an album. You should use a key of WikiDiscographyResult.albums.
   * @param {string} albumTitle Album's title
   * @param {WikiPageOptions} options save HTML to file, summary inclusion
   * @returns {Promise<WikiTrackResult>}
   */
  async searchTracks(
    albumTitle: string,
    options?: WT.WikiPageOptions,
  ): Promise<WT.WikiTrackResult> {
    let page;
    try {
      page = await this.wikiClient.page(albumTitle);
    } catch (e) {
      return {
        message: (e as Error).message,
      };
    }

    let summary: string = '';
    if (options?.summary) {
      summary = await page.summary();
    }

    const { pageid, title, touched } = page.raw;
    const content = await page.html();

    if (options?.saveHtml) {
      const curDir = `${process.cwd()}/${albumTitle}.html`;
      await WikiPedia.saveHTML(curDir, pretty(content));
    }

    const $ = cheerio.load(content);
    const tracks: WT.WikiTrack[] = [];
    const tables = $('table[class="tracklist"]');

    if (!tables.length) {
      return {
        message: `No tables found for ${albumTitle}`,
      };
    }

    const hasTwoSides = tables.length > 1;
    let isSideA = true;
    let isSideB = false;
    const lastTableIndex = 0;
    let lastTrackNum = 0;

    // for older albums, there are two sides, so two tables and the ordering
    // of the songs starts again from 1 in side B
    tables.each((i, table) => {
      if (hasTwoSides) {
        if (i !== lastTableIndex) {
          isSideA = false;
          isSideB = true;
        }
      }

      $(table).find('th[id*=track]').each((i, th) => {
        // when an album has two sides (cassette), Wikipedia is not consistent in listening
        // the tracks' order: sometimes it's increasing, sometimes starts again from 1
        let num = parseInt($(th).text().replace(/\./, ''), 10);
        if (lastTrackNum < num) {
          lastTrackNum = num;
        } else {
          num = ++lastTrackNum;
        }

        const title = this.cleanTrackTitle($(th).next());

        const thirdcol = $(th).next().next();
        const length = this.convertToSeconds(
          thirdcol.text().includes(':')
            ? thirdcol.text()
            : thirdcol.next().text(),
        );

        const side = hasTwoSides && isSideA ? 1 : 2;

        tracks.push(
          {
            num,
            title,
            side,
            length,
          },
        );
      });
    });

    const members = $('#Personnel').closest('h2').next('ul');
    const musicians: WT.WikiMusician[] = [];

    $(members).find('li').each((i, li) => {
      const musician = $(li).text();
      const [name, instruments] = musician.split(' – ');
      musicians.push({
        name, instruments,
      });
    });

    return {
      message: 'OK',
      data: {
        pageDetails: {
          pageid, title, touched, summary,
        },
        tracks,
        musicians,
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
