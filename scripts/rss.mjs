import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import GithubSlugger from 'github-slugger'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import tagData from '../app/tag-data.json' assert { type: 'json' }
import { allNews } from '../.contentlayer/generated/index.mjs'

const generateRssItem = (config, post) => `
  <item>
    <guid>${config.siteUrl}/News/${post.slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}/News/${post.slug}</link>
    ${post.summary && `<description>${escape(post.summary)}</description>`}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${config.email} (${config.author})</author>
    ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
  </item>
`

const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/News</link>
      <language>${config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

async function generateRSS(config, allNews, page = 'feed.xml') {
  const publishNews = allNews.filter((post) => post.draft !== true)
  // RSS for News post
  if (publishNews.length > 0) {
    const rss = generateRss(config, publishNews)
    writeFileSync(`./public/${page}`, rss)
  }

  if (publishNews.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredNews = allNews.filter((post) =>
        post.tags.map((t) => GithubSlugger.slug(t)).includes(tag)
      )
      const rss = generateRss(config, filteredNews, `tags/${tag}/${page}`)
      const rssPath = path.join('public', 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }
}

const rss = () => {
  generateRSS(siteMetadata, allNews)
  console.log('RSS feed generated...')
}
export default rss
