import Vue from 'vue'
import VueI18n from 'vue-i18n'
import deepmerge from 'deepmerge'

Vue.use(VueI18n)
/* eslint-disable */
function detectLanguage() {
  try {
    const lang = (window.navigator.languages && window.navigator.languages[0]) ||
      window.navigator.language ||
      window.navigator.userLanguage
    return [lang, lang.toLowerCase(), lang.substr(0, 2)].map(lang => lang.replace('-', '_'))
  } catch (e) {
    return undefined
  }
}

async function autoInstallLocale(lang) {
  try {
    let response = await fetch(`https://unpkg.com/vue-cli-locale-${lang}`)
    if (response.ok) {
      // Redirect
      const location = response.headers.get('location')
      if (location) {
        response = await fetch(`https://unpkg.com${location}`)
      }
      const data = await response.json()
      mergeLocale(lang, data)
      return true
    }
  } catch (e) { }
  return false
}

async function autoDetect() {
  const codes = detectLanguage()
  if (codes && codes[0].indexOf('zh') === -1) {
    let ok = false
    let previousCode
    for (const code of codes) {
      if (code === previousCode) continue
      previousCode = code
      ok = await tryAutoLang(code)
      if (ok) break
    }

    if (!ok) {
      console.log(`[UI] No locale package was found for your locale ${codes[0]}.`)
    }
  }
}

async function tryAutoLang(lang) {
  console.log(`[UI] Trying to load ${lang} locale...`)
  const result = await autoInstallLocale(lang)
  if (result) {
    i18n.locale = lang
    // eslint-disable-next-line no-console
    console.log(`[UI] Automatically loaded ${lang} locale `)
  }
  return result
}

const i18n = new VueI18n({
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: {
    zh: {}
  },
  silentTranslationWarn: process.env.NODE_ENV !== 'production'
})

autoDetect()

export function mergeLocale(lang, messages) {
  const newData = deepmerge(i18n.getLocaleMessage(lang), messages)
  i18n.setLocaleMessage(lang, newData)
}

export default i18n
