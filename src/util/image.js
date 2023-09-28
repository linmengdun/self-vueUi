/* eslint-disable */
export function getImageUrl(url) {
  // Fix images in development
  if (process.env.VUE_APP_CLI_UI_DEV && url.charAt(0) === '/') {
    return `http://101.33.215.164:${process.env.VUE_APP_GRAPHQL_PORT}${url}`
  }
  return url
}
