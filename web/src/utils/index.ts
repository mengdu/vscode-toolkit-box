export function isDev() {
  return import.meta.env.DEV
}

export function resolveMediaURL(file: string) {
  return window.mediaBaseURL.replace(/\/*$/, '') + '/' + file.replace(/^\/*/, '')
}
