/**
 * JsonLd — renders a schema.org JSON-LD <script> tag.
 *
 * Safe to use in both Server and Client components. The `<` characters are
 * escaped to prevent any chance of breaking out of the <script> context.
 */
type JsonLdData = Record<string, unknown> | Record<string, unknown>[]

export default function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
