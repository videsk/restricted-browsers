/**
 * A simple and fast class to detect and check if browser is restricted based on User-Agent
 * extracting browser name and version compared with your restriction browsers Object.
 *
 * Designed by @matiaslopezd for Videsk.
 *
 * @param {object} compatibility - Compatibility object
 * @param {object} options - Configuration object
 *
 * You can find the list of browsers format in
 */

const UAParser = require('ua-parser-js');
const { satisfies, clean } = require('semver');

class RestrictedBrowsers {
    constructor({ compatibility = {}, restrict = true, debug = false }) {
        this.compatibility = compatibility;
        this.restrict = restrict;
        this.ua = UAParser();
        this.Browser = { name: '', version: '', os: '' };
        this.debug = debug;
        this.__init();
    }

    async check() {
      // Compare
      return await this.__compare(this.compatibility, this.Browser.name);
    }

    __init() {
      // Check the restriction object is valid
      if (!this.compatibility || Object.keys(this.compatibility).length < 1) throw new Error('It\'s not possible check compatibility with a empty object.');
      // Get the browser and os
      const { browser, os } = this.ua;
      // Get browser name parsing first
      this.Browser.name = this.constructor.getName(this.compatibility, browser.name);
      // Get OS name parsing first
      this.Browser.os = this.constructor.getName(this.compatibility[this.Browser.name], os.name);
      // Get version parsing first
      this.Browser.version = this.constructor.parseVersion(browser.version);
    }

    __compare(obj = {}, name = '') {
      return new Promise(async (resolve) => {
        this.__debug('log', 'Key', name, 'is', typeof obj[name], 'on browsers with value', obj[name]);
        // This check if browser is restricted to version for all os
        if (name in obj &&  typeof obj[name] === 'string') resolve(satisfies(this.Browser.version, obj[name]));
        // This check if browser is restricted to version per os
        else if (name in obj && typeof obj[name] === 'object') resolve(await this.__compare(obj[name], this.Browser.os));
        // If not exist return restriction value
        else resolve(!this.restrict);
      })
    }

    static getName(obj = {}, name = '') {
      const contain = (lookup, browser) => new RegExp(`\\b${lookup.toLowerCase()}\\b`).test(browser.toLowerCase());
      const browsers = Object.keys(obj);
      const [ key ] = browsers.filter(key => contain(key, name));
      return key;
    }

    static parseVersion(version = '') {
      if (typeof version !== 'string') return null;
      let cleaned = version.split('.');
      cleaned.pop();
      cleaned = cleaned.join('.');
      return clean(cleaned);
    }

    __debug(type = 'log', ...args) {
      if (this.debug) console[type](...args);
    }

}

module.exports = RestrictedBrowsers;
