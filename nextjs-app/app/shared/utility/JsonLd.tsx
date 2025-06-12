import React from 'react'

interface JsonLdProps {
  json: object | string
}

const JsonLd: React.FC<JsonLdProps> = ({ json }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: typeof json === 'string' ? json : JSON.stringify(json),
    }}
  />
)

export default JsonLd
