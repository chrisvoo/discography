<h1>Discography</h1>

This is a module that can uses multiple providers and their API, like [WikiPedia](https://www.mediawiki.org/wiki/API:Get_the_contents_of_a_page), [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API) and [Genius](https://docs.genius.com/) in order to retrieve discographical information and songs lyrics.

- [Usage](#usage)
	- [Typescript](#typescript)
	- [Javascript](#javascript)
- [Providers](#providers)
	- [Wikipedia](#wikipedia)
		- [`searchDiscography(artist: string, options: WikiPageOptions)`](#searchdiscographyartist-string-options-wikipageoptions)
		- [`searchTracks(albumTitle: string, options?: WikiPageOptions)`](#searchtracksalbumtitle-string-options-wikipageoptions)
	- [MusicBrainz](#musicbrainz)
		- [`getArtistDiscography(artist: string, filterSecondaryTypes: string[])`](#getartistdiscographyartist-string-filtersecondarytypes-string)
		- [`getTracksByReleaseGroup(releaseGroup: string)`](#gettracksbyreleasegroupreleasegroup-string)
	- [Genius](#genius)
		- [`getLyrics(artistName: string, songName: string)`](#getlyricsartistname-string-songname-string)
	- [Discarded providers](#discarded-providers)
- [Terms of use](#terms-of-use)
- [Resources](#resources)

## Usage

Import the provider you need and call the available methods:

### Typescript

```typescript
import MusicBrainz, { Discography, Track, showResult } from 'discography';

const client = new MusicBrainz();
const result = await client.getArtistDiscography('Rancid', ['Live', 'Compilation', 'Single']);
const discography = result as Discography;
const { artist, releaseGroups } = discography;
```

### Javascript

```javascript
const { Genius, showResult } = require('discography');
const geniusClient = new Genius();
geniusClient.getLyrics('Rancid', 'Nihilsm')
	.then(showResult)
	.catch(console.error);
```


## Providers

### Wikipedia

API and HTML parsing are both used to ge the required information.

#### `searchDiscography(artist: string, options: WikiPageOptions)`

This method extracts basic info about the page, the artist's MusicBrainz ID (if present), and a list of all studio albums. Here is it an example of what you get when
you search `The Offspring`:

```javascript
{
    message: 'OK',
    data: {
    pageDetails: {
        pageid: 8426694,
        title: 'The Offspring discography',
        touched: '2021-05-15T21:56:52Z'
    },
    albums: {
        'The_Offspring_(album)': { title: 'The Offspring', released: 'June 15, 1989' },
        'Ignition_(The_Offspring_album)': { title: 'Ignition', released: 'October 16, 1992' },
        'Smash_(The_Offspring_album)': { title: 'Smash', released: 'April 8, 1994' },
        ...
        'Days_Go_By_(The_Offspring_album)': { title: 'Days Go By', released: 'June 26, 2012' },
        'Let_the_Bad_Times_Roll': { title: 'Let the Bad Times Roll', released: 'April 16, 2021' }
    },
    musicBrainzUrl: '//musicbrainz.org/artist/23a03e33-a603-404e-bcbf-2c00159d7067'
    }
}
```

You can pass the following options as second parameter:
* `saveHtml: boolean`: to save the HTML page in the current working directory
* `summary: boolean`: to get the page's summary with .

#### `searchTracks(albumTitle: string, options?: WikiPageOptions)`

This method lists all the songs of a particular album, converting the songs durations into seconds. Ideally you should execute `searchDiscography`, take a key of the resulting object (that is the final part the album Wiki page) and pass it to this method.
Here is it an example of what you get when you search `Smash_(The_Offspring_album)`.


```javascript
{
  message: 'OK',
  data: {
    pageDetails: {
      pageid: 172936,
      title: 'Smash (The Offspring album)',
      touched: '2021-05-15T21:56:34Z',
      summary: ''
    },
    tracks: [
      { num: 1, title: 'Time to Relax (Intro)', length: 25 },
      ...
      { num: 13, title: 'Not the One', length: 174 },
      { num: 14, title: 'Smash', length: 642 }
    ]
  }
}
```

### MusicBrainz

It allows to freely get all the discography details of an artist/band. The fundamental thing to know is the structure of the entities:

* An artist has many release groups (albums, compilations, live, etc)
* every release groups may have multiple releases of that album (differing for publishing date, country, etc)
* every release has many recordings (the tracks of an album)

#### `getArtistDiscography(artist: string, filterSecondaryTypes: string[])`

Retrieves the artist details and all the albums. The second parameter allows to filter
out those items that have the listed secondary types in their `secondaryTypes` array.
Here is it a possible response if you search for `Rancid` discography:

```javascript
{
  artist: {
    id: '24f8d8a5-269b-475c-a1cb-792990b0b2ee',
    name: 'Rancid',
    country: undefined,
    lifeSpan: { begin: '1991', ended: null },
    tags: [ 'punk', 'ska punk', 'punk rock' ],
    type: 'Group'
  },
  releaseGroups: [
    {
      id: '642238f2-24b6-3a0b-bfa7-9c0b4731989d',
      title: 'Rancid',
      primaryType: 'Album',
      releaseDate: '1993-05-10',
      secondaryTypes: []
    },
    ...
    {
      id: '03a80bc2-716f-4ea9-907d-7c8b9b7fb1cd',
      title: 'Trouble Maker',
      primaryType: 'Album',
      releaseDate: '2017-06-09',
      secondaryTypes: []
    }
  ]
}
```

#### `getTracksByReleaseGroup(releaseGroup: string)`

it allows to retrieve the tracks of a particular album. This method automatically selects the oldest release of an album and retrieves its tracks.
Here is it the response if you search for the release group `37c2647f-8e58-3839-a6b6-374c9ee88b1d`:

```javascript
    [
      {
        id: 'bfd6a742-7f73-399d-956b-3617c4bc1f02',
        length: 123440,
        title: 'Nihilism',
        position: 1
      },
      {
        id: '897a2f83-da32-3165-acc5-876662594588',
        length: 173280,
        title: 'Radio',
        position: 2
      },
      //...
    ]
```

### Genius

It allows to retrieve the lyrics of a particular song, given its title an the artist. If you don't provide an access token, it scrapes the search page results.

#### `getLyrics(artistName: string, songName: string)`

This is the only method present inside the class. If you execute `getLyrics('Rancid', 'Nihilism')`, you'll obtain something like that:

```javascript
    {
      id: 1702216,
      artistId: 30419,
      title: 'Nihilism',
      lyrics: 'Come into the union district\n' +
        'Drive down on Sharmon Palms\n' +
        'White ghettos paint a picture\n' +
        'Broken homes and broken bones\n' +
        '\n' +
        //...
    }
```

### Discarded providers

Before landing to the final solution, different API were tested:

* [Discogs API](https://www.discogs.com/developers): it returns a lot of information. By using filters, the `search` endpoint returns something more manageable and precise, anyway the data weren't accurate ([here's the GIST showing that](https://gist.github.com/chrisvoo/b8e34fc88b788fbc1ab08344c8a06291)).
* [LastFM](https://www.last.fm/api/show/artist.getTopAlbums): even in this case, searching for the artist's top albums returns 57034 results for 1141 pages ([here's the GIST showing that](https://gist.github.com/chrisvoo/4eef37cd6bfecf7654f826dd2f970039)).

## Terms of use

* [Wikipedia](https://www.mediawiki.org/wiki/API:Etiquette): it recommends to serially do requests and to use a meaningful user agent.
* [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting) one request per second and a meaningful user agent.
* Genius: no particular limitations exposed in their web site.

## Resources

* [Wikipedia API Sandbox](https://en.wikipedia.org/wiki/Special:ApiSandbox)
* [MusicBrainz search form](https://musicbrainz.org/search)
* [MusicBrainz API changes](https://blog.metabrainz.org/category/musicbrainz+breaking-changes/)
