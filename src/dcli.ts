import dotenv from 'dotenv';
import { envSchema } from './utils';
import MusicBrainz from './provider/MusicBrainz';
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
  const mb = new MusicBrainz();
  const res = await mb.searchArtistDiscography(
    'rancid', ['Live', 'Demo', 'Compilation'],
  );

  showResult(res);
})();
