import dotenv from 'dotenv';
import wiki from 'wikijs';
import fs from 'fs';
import cheerio from 'cheerio';
import { envSchema } from './utils';
import { showResult } from './utils/terminal';

const result = dotenv.config();

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

const { error } = envSchema.validate(result.parsed);
if (error) {
  console.error(error.message);
  process.exit(1);
}

(async () => {
  const searchParam = 'blink182 discography';
  const wikiClient = wiki({
    apiUrl: 'https://en.wikipedia.org/w/api.php',
  });

  const page = await wikiClient.find(searchParam);

  if (!page) {
    console.log('Nothing found for the specified query');
    return;
  }

  const { pageid, title, touched } = page.raw;
  console.log(`${title} - ID: ${pageid}, last edited: ${touched}`);

  /*   const studioAlbums = await page.fullInfo()
    .then((info: any) => {
      if (info?.general?.studio) {
        return parseInt(info.general.studio, 10);
      }
      return 0;
    })
    .catch((e) => { console.error(e.message); return 0; }); */
  let content: string = '';
  try {
    content = await fs.promises.readFile(`./${title}.html`, { encoding: 'utf-8' });
  } catch (e) {
    console.info('Cannot find HTML page, calling API...');
    content = await page.html();
    await fs.promises.writeFile(`./${title}.html`, content);
  }

  if (content.length > 0) {
    const $ = cheerio.load(content);
    const table = $('#Studio_albums').parent('h3').next('table');
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
    showResult(albums);
  }
})();
