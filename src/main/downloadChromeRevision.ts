import * as Electron from 'electron'
import * as Puppeteer from 'puppeteer'

import Logger from '../Logger'

const getPath = () => `${(Electron.app || Electron.remote.app).getPath('userData')}/chromium`

export const getLocalRevision = (revision: string): string | undefined => {
  const browserFetcher = (Puppeteer as any).createBrowserFetcher({ path: getPath() })
  const { local, executablePath } = browserFetcher.revisionInfo(revision)

  if (local) {
    Logger.debug(`Chrome version available: ${executablePath}`)
    return executablePath
  } else {
    return undefined
  }
}

export const getLatestRevisions = async (): Promise<string> => {
  const browserFetcher = (Puppeteer as any).createBrowserFetcher({ path: getPath() })

  const revisions = await browserFetcher.localRevisions()

  return revisions.sort().reverse[0]
}

export const downloadRevision = async (
  revision: string,
  callback: (downloadedBytes: number, totalBytes: number) => void
): Promise<string> => {
  const existingExecutablePath = getLocalRevision(revision)

  if (existingExecutablePath) {
    return existingExecutablePath
  }

  const browserFetcher = (Puppeteer as any).createBrowserFetcher({ path: getPath() })

  const revisions = await browserFetcher.localRevisions()

  Logger.debug(revisions)

  for (const oldRevision of revisions) { // tslint:disable-line:forin
    Logger.info(`Revision ${revision}: Start deleting`)
    try {
      await browserFetcher.remove(oldRevision)
      Logger.info(`Revision ${oldRevision}: Deleted`)
    } catch (e) {
      Logger.error(`Revision ${oldRevision}: Deleting failed`, e)
    }
  }

  const { executablePath } = await browserFetcher.download(revision, callback)

  return executablePath
}
