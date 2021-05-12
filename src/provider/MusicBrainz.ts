import axios, {
  AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType,
} from 'axios';

export enum Entity {
    area = 'area',
    artist = 'artist',
    event = 'event',
    genre = 'genre',
    instrument = 'instrument',
    label = 'label',
    place = 'place',
    recording = 'recording',
    release = 'release',
    'release-group' = 'release-group',
    series = 'series',
    work = 'work',
    url = 'url'
}

export interface SearchParams {
  query: string
  limit?: number
  offset?: number
}

export default class MusicBrainz {
    private API_ROOT_URL: string;

    private request: AxiosInstance;

    constructor() {
      this.API_ROOT_URL = 'https://musicbrainz.org/ws/2';
      this.request = axios.create({
        baseURL: this.API_ROOT_URL,
        timeout: 5000,
        headers: { Accept: 'application/json' },
      });
    }

    private search(entity: Entity, params: SearchParams):
    Promise<AxiosResponse<any>> {
      let query = encodeURI(params.query);
      if ('limit' in params) {
        query += `&limit=${params.limit}`;
      }

      if ('offset' in params) {
        query += `&offset=${params.offset}`;
      }

      return this.request.get(`/${entity}/?query`);
    }

    private lookup(entity: Entity, mbid: string, includeParams: string):
    Promise<AxiosResponse<any>> {
      let queryString = '';
      if (includeParams && includeParams.trim().length > 0) {
        queryString = `?inc=${includeParams.trim()}`;
      }

      return this.request.get(`/${entity}/${mbid}${queryString}`);
    }
}
