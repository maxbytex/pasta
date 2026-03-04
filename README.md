# Pasta

A personal finance web app for tracking your portfolio and expenses with a chat
assistant.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMiguelRipoll23%2Fpasta&env=VITE_API_BASE_URL,VITE_DEFAULT_CURRENCY_CODE&envDefaults=%7B%22VITE_API_BASE_URL%22%3A%22https%3A%2F%2Ffinanceserver.yourusername.deno.net%22%2C%22VITE_DEFAULT_CURRENCY_CODE%22%3A%22USD%22%7D)

## Features

- Seamless authentication using passkeys
- Dashboard overview to track income, investments and expenses
- Multiple editors to view, edit or delete any data
- Interactive chat assistant for financial queries

## Configuration

Use the deploy button above to publish to Vercel and set the `VITE_API_BASE_URL`
environment variable to your Deno deployment base URL.

The API server used by this front-end is a separate project,
[see this repository.](https://github.com/MiguelRipoll23/financeserver)

## Demo

![Home](screenshots/home.png) ![Chat](screenshots/chat.png)
