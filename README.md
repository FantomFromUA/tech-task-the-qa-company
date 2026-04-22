# SpaceX Launch Explorer

A React app for browsing SpaceX launch history, built with React, TypeScript, and MUI.

## Features

- Paginated table of SpaceX launches fetched from the public SpaceX API
- Search launches by name (debounced)
- Filter by launch status: All / Success / Failed / Unknown
- Sort by flight number, name, date, or status
- URL state — pagination, search, sort, and filters are persisted in the query string
- Click any row to open a details drawer with mission info and links
- Select rows via checkbox and copy them to clipboard
- Responsive layout for mobile and desktop

## Tech stack

- React 19 + TypeScript
- MUI v9 (Material UI + DataGrid)
- SpaceX REST API v4

## Getting started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the development server |
| `npm test` | Run tests in watch mode |
| `npm run build` | Build for production |
