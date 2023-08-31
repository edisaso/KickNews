import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allNews } from 'contentlayer/generated'
import Main from './Main'

export default async function Page() {
  const sortedPosts = sortPosts(allNews)
  const posts = allCoreContent(sortedPosts)
  return <Main posts={posts} />
}
