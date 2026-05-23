# Stargate

This application is used as a portal between my public and private services. Therefore I found the akronym stargate suitable. It has a long history as a technical playground. It existed already in multiple techstacks and hosted on all kind of plattforms.

## Techstack

- UI framework [Svelte 5](https://svelte.dev/)
- Design system [Skeleton.dev](https://www.skeleton.dev)
- Charts [Apexcharts](https://apexcharts.com/)
- Hosted on [Cloudflare Workers](https://www.cloudflare.com/products/workers/)
- Storage [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- Secured by [Cloudflare Access](https://www.cloudflare.com/products/access/)

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
