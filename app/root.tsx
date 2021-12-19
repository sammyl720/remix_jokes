import {LinksFunction, Meta, MetaFunction, Scripts, useCatch} from 'remix';
import { Links, LiveReload, Outlet } from "remix";
import globalStyles from './styles/global.css';
import globalMediumStyles from './styles/global-medium.css';
import globalLargeStyles from './styles/global-large.css';
import React from 'react';

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: globalStyles
  },
  {
    rel: "stylesheet",
    href: globalMediumStyles,
    media: "print, (min-width: 640px)"
  },
  {
    rel: "stylesheet",
    href: globalLargeStyles,
    media: "screen (min-width: 1024px)"
  }
];

export const meta: MetaFunction = () => {
  const description = `Learn Remix and laugh at the same time!`;

  return {
    description,
    keywords: "Remix,jokes",
    "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": "Remix Jokes",
    "twitter:description": description
  }
}

function Document({
  children,
  title = `Remix, So great, it's funny!`
}: {
  children: React.ReactNode,
  title?: string
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>{title}</title>
      </head>
      <body>
        { children }
        <Scripts />
        {process.env.NODE_ENV === 'development' ? (
          <LiveReload />
        ) : null }
      </body>
    </html>
  );
}


export default function App(){
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document
      title={`${caught.status} ${caught.statusText}`}
      >
        <div className="error-container">
          <h1>
            {caught.status} {caught.statusText}
          </h1>
        </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }){
  console.error(error)
  return (
    <Document title='Uh-oh!'>
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}