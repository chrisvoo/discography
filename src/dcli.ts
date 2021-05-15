import dotenv from 'dotenv';
import { envSchema } from './utils';
// import MusicBrainz from './provider/MusicBrainz';
import { showResult } from './utils/terminal';
import Genius from './provider/Genius';

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
/*   const mb = new MusicBrainz();
  const res = await mb.getArtistDiscography(
    'rancid', ['Live', 'Demo', 'Compilation'],
  );
  showResult(res);

  if ('artist' in res) {
    const releaseGroup = res.releaseGroups.filter((rg) => rg.title.includes('Wolves'))[0];
    const tracks = await mb.getTracksByReleaseGroup(releaseGroup.id);
    showResult(tracks);
  } */
  const genius = new Genius();
  const lyrics = await genius.getLyrics('Rancid', 'Ruby Soho');
  showResult(lyrics);
})();
