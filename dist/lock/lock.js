(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Lock button
 *
 * This feature creates a lock button in the control bar that will block access
 * to the controls while active. It can be deactivated by clicking multiple
 * times on the unlock icon.
 */

// Translations (English required)

mejs.i18n.en["mejs.lock"] = "Lock";
mejs.i18n.en["mejs.unlock"] = "Unlock";

// Feature configuration
Object.assign(mejs.MepDefaults, {
	/**
  * @type {?String}
  */
	lockText: null,
	/**
  * @type {?String}
  */
	unlockText: null,
	/**
  * @type {Boolean}
  */
	autohideUnlock: true,
	/**
  * Number of clicks to unlock
  * @type {Number}
  */
	unlockClicks: 3,
	/**
  * The amount of time in which to register the unlock clicks in milliseconds
  * @type {Number}
  */
	unlockTimeWindow: 2000
});

Object.assign(MediaElementPlayer.prototype, {
	/**
  * Feature constructor.
  *
  * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
  * @param {MediaElementPlayer} player
  * @param {$} controls
  * @param {$} layers
  * @param {HTMLElement} media
  */
	buildlock: function buildlock(player, controls, layers, media) {
		var t = this,
		    lockText = mejs.Utils.isString(t.options.lockText) ? t.options.lockText : mejs.i18n.t('mejs.lock'),
		    unlockText = mejs.Utils.isString(t.options.unlockText) ? t.options.unlockText : mejs.i18n.t('mejs.unlock');
		var clicks = 0,
		    locked = false,
		    timeouts = [];

		// Unlock button
		player.unlockButton = document.createElement('div');
		player.unlockButton.className = t.options.classPrefix + "layer " + t.options.classPrefix + "unlock-button";
		player.unlockButton.innerHTML = "<button type=\"button\" title=\"" + unlockText + "\" aria-label=\"" + unlockText + "\" tabindex=\"0\"></button>";
		player.unlockButton.style.display = 'none';
		layers.insertBefore(player.unlockButton, layers.firstChild);

		player.unlockButton.addEventListener('click', function () {
			clicks += 1;
			if (clicks >= t.options.unlockClicks) {
				while (timeouts.length > 0) {
					clearTimeout(timeouts.pop());
				}
				t.unlock();
			}
			timeouts.push(setTimeout(function () {
				clicks -= 1;
				if (clicks === 0 && t.options.autohideUnlock) {
					player.unlockButton.style.display = 'none';
				}
			}, t.options.unlockTimeWindow));
		});

		// Lock button
		player.lockButton = document.createElement('div');
		player.lockButton.className = t.options.classPrefix + "button " + t.options.classPrefix + "lock-button";
		player.lockButton.innerHTML = "<button type=\"button\" aria-controls=\"" + t.id + "\" title=\"" + lockText + "\" aria-label=\"" + lockText + "\" tabindex=\"0\"></button>";
		t.addControlElement(player.lockButton, 'lock');

		// add a click toggle event
		player.lockButton.addEventListener('click', function () {
			t.lock();
		});

		/**
   * Show unlock button
   *
   *@private
   */
		var showUnlock = function showUnlock() {
			player.unlockButton.style.display = '';
			setTimeout(function () {
				if (clicks === 0 && t.options.autohideUnlock) {
					player.unlockButton.style.display = 'none';
				}
			}, t.options.unlockTimeWindow);
		};

		Object.defineProperty(t, 'locked', {
			get: function get() {
				return locked;
			},

			set: function set(value) {
				if (locked === value) {
					return;
				}
				locked = value;
				if (locked) {
					clicks = 0;
					media.addEventListener('click', showUnlock);
					t.options.clickToPlayPause = false;
					t.disableControls();
					if (!t.options.autohideUnlock) {
						t.unlockButton.style.display = '';
					}
				} else {
					media.removeEventListener('click', showUnlock);
					t.options.clickToPlayPause = true;
					t.enableControls();
					t.unlockButton.style.display = 'none';
				}
			}
		});
	},
	lock: function lock() {
		this.locked = true;
	},
	unlock: function unlock() {
		this.locked = false;
	}
});

},{}]},{},[1]);
