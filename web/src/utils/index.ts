export function isDev() {
  return import.meta.env.DEV
}

// export function resolveLibUrl(file: string) {
//   return window.LibURL.replace(/\/*$/, '') + '/' + file.replace(/^\/*/, '')
// }
