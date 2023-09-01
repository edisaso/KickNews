import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import GithubSlugger from 'github-slugger'
import siteMetadata from '../data/siteMetadata.js'
import tagData from '../app/tag-data.json' assert { type: 'json' }
import { allNews } from '../.contentlayer/generated/index.mjs'

const generateRssItem = (config, post) => {
  const title = post.title || ''; // Default to an empty string if title is not defined
  const summary = post.summary || ''; // Default to an empty string if summary is not defined

  return `
    <item>
      <guid>${config.siteUrl}/News/${post.slug}</guid>
      <link>${config.siteUrl}/News/${post.slug}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${config.email} (${config.author})</author>
      ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
    </item>
  `;
};


const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
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
  const publishPosts = allNews.filter((post) => post.draft !== true)
  // RSS for News post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, publishPosts)
    writeFileSync(`./public/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = allNews.filter((post) =>
        post.tags.map((t) => GithubSlugger.slug(t)).includes(tag)
      )
      const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
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
