import axios, {
  AxiosInstance, AxiosResponse, AxiosError,
} from 'axios';
import {
  Artist, ArtistDetails, Discography, Entity, ErrorResponse, ReleaseGroup,
  ReleaseGroupDetails,
  SearchArtistResult, SearchParams, Tag, Track,
} from './types/MusicBrainzTypes';

/**
 * An artist has many release groups (albums, live, collections). Every release group may have
 * many releases in different formats (CD, vinyl, etc) and countries.
 * Every release has a list of recordings (tracks) */
export class MusicBrainz {
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
     * release groups (only studio albums)
     * @param {string} artist The artist's name
     * @param {string[]} filterOutSecondaryTypes A list of secondary types to be filtered out
     * @returns {Promise<Discography | ErrorResponse>}
     */
    async getArtistDiscography(
      artist: string,
      filterOutSecondaryTypes: string[] = [],
    ): Promise<Discography | ErrorResponse> {
      let result: AxiosResponse<SearchArtistResult>;
      try {
        result = await this.search(Entity.artist, {
          query: `artistaccent:${artist}`,
        });
      } catch (e) {
        return {
          error: true,
          message: (e as AxiosError).response?.data.error || (e as Error).message,
        };
      }

      const { count, artists } = result.data;
      let foundArtist: Artist;

      if (result.data.count > 1) {
        foundArtist = artists.filter(
          (a): boolean => a.score === Math.max(...artists.map((a): number => a.score)),
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
          message: (e as AxiosError).response?.data.error || (e as Error).message,
        };
      }
      const {
        id, name, country, tags, type,
      } = foundArtist;

      let groups = releaseGroupsResponse.data['release-groups'];

      groups = groups.filter(
        (group): boolean => group['primary-type'] === 'Album',
      );

      if (filterOutSecondaryTypes.length > 0) {
        groups = groups.filter(
          (group): boolean => group['secondary-types'].every(
            (type): boolean => !filterOutSecondaryTypes.includes(type),
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
        releaseGroups: groups.map((group): ReleaseGroupDetails => ({
          id: group.id,
          title: group.title,
          primaryType: group['primary-type'],
          releaseDate: group['first-release-date'],
          secondaryTypes: group['secondary-types'],
        })),
      };
    }

    /**
     * Here we automatically take the oldest release of a release group and call the `getTracks`
     * method. This is done to simplify the obtainment of the information, since you get many
     * releases for each group.
     * @param {string} releaseGroup A release group id
     * @returns {Promise<Track[] | ErrorResponse>}
     */
    async getTracksByReleaseGroup(releaseGroup: string): Promise<Track[] | ErrorResponse> {
      let releasesResponse: AxiosResponse<any>;
      try {
        releasesResponse = await this.lookup(Entity['release-group'], releaseGroup, 'releases');
      } catch (e) {
        return {
          error: true,
          message: (e as AxiosError).response?.data.error || (e as Error).message,
        };
      }

      // they should be already incrementally ordered by date, but we do the same
      const releaseId: string = releasesResponse.data.releases.sort((r1: any, r2: any) => {
        if (r1.date === r2.date) return 0;

        return r1.date > r2.count ? -1 : 1;
      })[0].id;

      return this.getTracksByRelease(releaseId);
    }

    async getArtist(name: string): Promise<ArtistDetails | ErrorResponse | null> {
      let artistReponse: AxiosResponse<any>;

      try {
        artistReponse = await this.search(Entity.artist, {
          query: `${name} AND type:Person`,
          limit: 1,
        });
      } catch (e) {
        return {
          error: true,
          message: (e as AxiosError).response?.data.error || (e as Error).message,
        };
      }

      if (artistReponse.data.artists.length) {
        const artist = artistReponse.data.artists[0];

        const {
          id, name, type, country, tags,
        } = artist;
        const lifeSpan = artist['life-span']; // begin, end

        return {
          id,
          type,
          name,
          country,
          lifeSpan: {
            begin: lifeSpan.begin,
            ended: lifeSpan.end,
          },
          tags,
        };
      }

      return null;
    }

    /**
     * Here we retrieve the recordings of a specific release.
     * @param {string} releaseId A release id
     * @returns {Promise<Track[] | ErrorResponse>}
     */
    async getTracksByRelease(releaseId: string): Promise<Track[] | ErrorResponse> {
      let releasesResponse: AxiosResponse<any>;
      try {
        releasesResponse = await this.lookup(Entity.release, releaseId, 'recordings');
      } catch (e) {
        return {
          error: true,
          message: (e as AxiosError).response?.data.error || (e as Error).message,
        };
      }

      return releasesResponse.data.media[0].tracks.map((track: any) => ({
        id: track.id,
        length: track.length, // ms
        title: track.title,
        position: track.position,
      }));
    }
}
