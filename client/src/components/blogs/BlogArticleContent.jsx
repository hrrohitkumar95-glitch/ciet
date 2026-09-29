/** Renders CMS-managed article HTML using the shared editorial typography. */
export default function BlogArticleContent({ content }) {
  return <div className="rich-text" dangerouslySetInnerHTML={{ __html: content || "" }} />;
}
