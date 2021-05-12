# discocli

A client to get artists' discographies

## Description

Before landing to the final solution, different API were tested:

* [Discogs API](https://www.discogs.com/developers): it returns a lot of information. By using filters, the `search` endpoint returns something more manageable and precise, anyway the data weren't accurate ([here's the GIST showing that](https://gist.github.com/chrisvoo/b8e34fc88b788fbc1ab08344c8a06291)).
* [LastFM](https://www.last.fm/api/show/artist.getTopAlbums): even in this case, searching for the artist's top albums returns 57034 results for 1141 pages ([here's the GIST showing that](https://gist.github.com/chrisvoo/4eef37cd6bfecf7654f826dd2f970039)).


https://blog.metabrainz.org/category/musicbrainz+breaking-changes/