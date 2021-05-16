<h1>discocli</h1>

This is intended to be both an importable module and a CLI app (in progress). It can uses multiple providers and their API, like [WikiPedia](https://www.mediawiki.org/wiki/API:Get_the_contents_of_a_page) (discography and history), [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API) (discography information) and [Genius](https://docs.genius.com/) (lyrics).

- [Providers](#providers)
  - [Wikipedia](#wikipedia)
    - [`searchDiscography(artist: string, options: WikiPageOptions)`](#searchdiscographyartist-string-options-wikipageoptions)
    - [`searchTracks(albumTitle: string, options?: WikiPageOptions)`](#searchtracksalbumtitle-string-options-wikipageoptions)
  - [Discarded providers](#discarded-providers)
- [Terms of use](#terms-of-use)
- [Resources](#resources)

## Providers

### Wikipedia

#### `searchDiscography(artist: string, options: WikiPageOptions)`

This method extracts basic info about the page, the artist's MusicBrainz ID (if present), and a list of all studio albums. Here is it an example of what you get when
you search `The Offspring`:

```json
{
    message: 'OK',
    data: {
    pageDetails: {
        pageid: 8426694,
        title: 'The Offspring discography',
        touched: '2021-05-15T21:56:52Z'
    },
    albums: {
        '/wiki/The_Offspring_(album)': { title: 'The Offspring', released: 'June 15, 1989' },
        '/wiki/Ignition_(The_Offspring_album)': { title: 'Ignition', released: 'October 16, 1992' },
        '/wiki/Smash_(The_Offspring_album)': { title: 'Smash', released: 'April 8, 1994' },
        '/wiki/Ixnay_on_the_Hombre': { title: 'Ixnay on the Hombre', released: 'February 4, 1997' },
        '/wiki/Americana_(The_Offspring_album)': { title: 'Americana', released: 'November 17, 1998' },
        '/wiki/Conspiracy_of_One': { title: 'Conspiracy of One', released: 'November 14, 2000' },
        '/wiki/Splinter_(The_Offspring_album)': { title: 'Splinter', released: 'December 9, 2003' },
        '/wiki/Rise_and_Fall,_Rage_and_Grace': {
        title: 'Rise and Fall, Rage and Grace',
        released: 'June 17, 2008'
        },
        '/wiki/Days_Go_By_(The_Offspring_album)': { title: 'Days Go By', released: 'June 26, 2012' },
        '/wiki/Let_the_Bad_Times_Roll': { title: 'Let the Bad Times Roll', released: 'April 16, 2021' }
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


```json
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
      { num: 2, title: 'Nitro (Youth Energy)', length: 147 },
      { num: 3, title: 'Bad Habit', length: 223 },
      { num: 4, title: 'Gotta Get Away', length: 232 },
      { num: 5, title: 'Genocide', length: 213 },
      { num: 6, title: 'Something to Believe In', length: 197 },
      { num: 7, title: 'Come Out and Play', length: 197 },
      { num: 8, title: 'Self Esteem', length: 257 },
      { num: 9, title: "It'll Be a Long Time", length: 163 },
      { num: 10, title: 'The Didjits', length: 122 },
      { num: 11, title: 'What Happened to You?', length: 132 },
      { num: 12, title: 'So Alone', length: 77 },
      { num: 13, title: 'Not the One', length: 174 },
      { num: 14, title: 'Smash', length: 642 }
    ]
  }
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