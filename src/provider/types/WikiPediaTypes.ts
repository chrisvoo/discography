export type WikiAlbum = {
    title: string
    released: string
}

export type WikiAlbumReference = {
	albumPk: number,
	wikiPage: string
}

export type WikiPage = {
    title: string
    pageid: number
    summary: string
    touched: string // date
}

export type AlbumItem = {
		wikiPage: string,
		album: WikiAlbum
}

export type WikiDiscography = {
    pageDetails: WikiPage
    musicBrainzUrl?: string
    albums: AlbumItem[]
}

export type WikiPageOptions = {
  saveHtml?: boolean
  summary?: boolean
}

export type WikiDiscographyResult = {
    message: string
    data?: WikiDiscography
}

export type WikiTrack = {
  num: number
  title: string
  side: number
  length: number
}

export type WikiMusician = {
	name: string,
	instruments: string
}

export type WikiTrackResult = {
  message: string
  data?: {
    pageDetails: WikiPage,
    tracks: WikiTrack[],
		musicians: WikiMusician[]
  }
}
