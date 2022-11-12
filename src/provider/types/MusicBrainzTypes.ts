export interface ReleaseGroupDetails {
	id: string
	title: string
	releaseDate: string
	primaryType: string
	secondaryTypes: string[]
}

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

export interface Tag {
	count: number
	name: string
}

export interface Artist {
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

export interface ReleaseGroup {
	id: string
	'first-release-date': string
	'primary-type': string
	title: string
	'secondary-types': string[] // Live, Compilation
}

export interface Discography {
	artist: ArtistDetails,
	releaseGroups: ReleaseGroupDetails[]
}

export interface ErrorResponse {
	error: true,
	message: string
}

export interface Track {
	id: string
	length: number
	title: string
	position: number
}
