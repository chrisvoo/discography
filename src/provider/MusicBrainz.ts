import axios, {
  AxiosInstance, AxiosResponse,
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

interface Tag {
  count: number
  name: string
}

interface Artist {
  id: string // uuid
  type: 'Group' | 'Person'
  'type-id': string // uuid
  score: number
  name: string
  country: string // ISO code, eg US
  'life-span': {
    begin: string
    ended: string | null
  },
  tags: Tag[]
}

// just a refactored subset of artist
export interface ArtistDetails {
  id: string // uuid
  type: 'Group' | 'Person'
  name: string
  country: string // ISO code, eg US
  lifeSpan: {
    begin: string
    ended: string | null
  },
  tags: string[]
}

export interface SearchArtistResult {
  count: number
  artists: Artist[]
}

interface ReleaseGroup {
  id: number
  'first-release-date': string
  'primary-type': string
  title: string
  'secondary-types': string[] // Live, Compilation
}

export interface ReleaseGroupDetails {
  id: number
  title: string
  releaseDate: string
  primaryType: string
  secondaryTypes: string[]
}

export interface Discography {
  artist: ArtistDetails,
  releaseGroups: ReleaseGroupDetails[]
}

export interface ErrorResponse {
  error: true,
  message: string
}

/**
 * Implements the search artist and release-groups lookup.
 */
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

    /**
     * A generic search that follows the pattern:
     * `/<ENTITY_TYPE>?query=<QUERY>&limit=<LIMIT>&offset=<OFFSET>`.
     * @param {Entity} entity An entity, that will be part of the final endpoint
     * @param {SearchParams} params Pagination and query string params
     * @returns {Promise<AxiosResponse<any>>}
     */
    private search(entity: Entity, params: SearchParams):
    Promise<AxiosResponse<any>> {
      let query = encodeURI(params.query);
      if ('limit' in params) {
        query += `&limit=${params.limit}`;
      }

      if ('offset' in params) {
        query += `&offset=${params.offset}`;
      }

      return this.request.get(`/${entity}/?query=${query}`);
    }

    /**
     * A generic lookup that follow the pattern `/<ENTITY_TYPE>/<MBID>?inc=<INC>`
     * @param {Entity} entity An entity, that will be part of the final endpoint
     * @param {string} mbid MusicBrainz UUID for the entity
     * @param {string} includeParams Query string that define what to include
     * @returns {Promise<AxiosResponse<any>>}
     */
    private lookup(entity: Entity, mbid: string, includeParams: string):
    Promise<AxiosResponse<any>> {
      let queryString = '';
      if (includeParams && includeParams.trim().length > 0) {
        queryString = `?inc=${includeParams.trim()}`;
      }

      return this.request.get(`/${entity}/${mbid}${queryString}`);
    }

    /**
     * Return a significant and limited list of tags for an artist.
     * @param {Tag[]} tags All the tags related to the artist
     * @param {number} limit Limit the number of tags
     * @returns {string[]} the list of most common tags for the artist
     */
    private getMainTags(tags: Tag[], limit: number = 3): string[] {
      return tags
        .sort((t1, t2) => {
          if (t1.count === t2.count) return 0;

          return t1.count > t2.count ? -1 : 1;
        })
        .map((t) => t.name)
        .slice(0, limit);
    }

    /**
     * Searches the best match for the specified artist and automatically returns the
     * release groups.
     * @param {string} artist The artist's name
     * @param {string[]} filterSecondaryTypes A list of secondary types to be filtered out
     * @returns {Promise<Discography | ErrorResponse>}
     */
    async searchArtistDiscography(
      artist: string,
      filterSecondaryTypes: string[] = [],
    ): Promise<Discography | ErrorResponse> {
      let result: AxiosResponse<SearchArtistResult>;
      try {
        result = await this.search(Entity.artist, {
          query: `artistaccent:${artist}`,
        });
      } catch (e) {
        return {
          error: true,
          message: e.data.error,
        };
      }

      const { count, artists } = result.data;
      let foundArtist: Artist;

      if (result.data.count > 1) {
        foundArtist = artists.filter(
          (a) => a.score === Math.max(...artists.map((a) => a.score)),
        )[0];
      } else {
        foundArtist = artists[0];
      }

      let releaseGroupsResponse: AxiosResponse<{'release-groups': ReleaseGroup[]}>;
      try {
        releaseGroupsResponse = await this.lookup(Entity.artist, foundArtist.id, 'release-groups');
      } catch (e) {
        return {
          error: true,
          message: e.data.error,
        };
      }
      const {
        id, name, country, tags, type,
      } = foundArtist;

      let groups = releaseGroupsResponse.data['release-groups'];

      if (filterSecondaryTypes.length > 0) {
        groups = groups.filter(
          (group) => group['secondary-types'].every(
            (type) => !filterSecondaryTypes.includes(type),
          ),
        );
      }

      return {
        artist: {
          id,
          name,
          country,
          lifeSpan: foundArtist['life-span'],
          tags: this.getMainTags(tags),
          type,
        },
        releaseGroups: groups.map((group) => ({
          id: group.id,
          title: group.title,
          primaryType: group['primary-type'],
          releaseDate: group['first-release-date'],
          secondaryTypes: group['secondary-types'],
        })),
      };
    }
}
