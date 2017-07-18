import { tr } from './translation';
import { genId } from './utils';

export default class Inserter {
  constructor() {
    this.pasteOptions = {
      fit: {
        handle: (img) => {
          this.main.fitImage(img);
        },
      },
      extend_down: {
        handle: (img) => {
          this.tmpImg = img;
          const oldH = this.main.size.h;
          const oldW = this.main.size.w;
          const newH = oldH + img.naturalHeight;
          const newW = Math.max(oldW, img.naturalWidth);
          const tmpData = this.ctx.getImageData(0, 0, this.main.size.w, this.main.size.h);
          this.main.resize(newW, newH);
          this.main.clearBackground();
          this.ctx.putImageData(tmpData, 0, 0);
          this.main.adjustSizeFull();
          this.worklog.captureState();
          if (img.naturalWidth < oldW) {
            const offset = Math.round((oldW - img.naturalWidth) / 2);
            this.main.select.placeAt(offset, oldH, offset, 0, img);
          } else {
            this.main.select.placeAt(0, oldH, 0, 0, img);
          }
        },
      },
      extend_right: {},
      over: {},
    };
  }

  init(main) {
    this.ctx = main.ctx;
    this.main = main;
    this.worklog = main.worklog;
    this.selector = main.wrapper.querySelector('.ptro-paster-select-wrapper');
    this.selector.setAttribute('hidden', '');
    this.img = null;
    Object.keys(this.pasteOptions).forEach((k) => {
      const o = this.pasteOptions[k];
      document.getElementById(o.id).onclick = () => {
        if (this.loading) {
          this.doLater = o.handle;
        } else {
          o.handle(this.img);
        }
        this.selector.setAttribute('hidden', '');
      };
    });
    this.loading = false;
    this.doLater = null;
  }

  insert(x, y, w, h) {
    console.log("inserting ", this.tmpImg, x, y, w, h);
    this.main.ctx.drawImage(this.tmpImg, x, y, w, h);
  }

  loaded(img) {
    this.img = img;
    this.loading = false;
    if (this.doLater) {
      this.doLater(img);
      this.doLater = null;
    }
  }

  handleOpen(source) {
    const img = new Image();
    const empty = this.main.worklog.empty;
    img.onload = () => {
      if (empty) {
        this.main.fitImage(img);
      } else {
        this.loaded(img);
      }
      this.finishLoading();
    };
    this.startLoading();
    img.src = source;
    if (!empty) {
      this.selector.removeAttribute('hidden');
    }
  }

  startLoading() {
    this.loading = true;
    const btn = document.getElementById(this.main.toolByName.open.buttonId);
    const icon = document.querySelector(`#${this.main.toolByName.open.buttonId} > i`);
    if (btn) {
      btn.setAttribute('disabled', 'true');
    }
    if (icon) {
      icon.className = 'ptro-icon ptro-icon-loading ptro-spinning';
    }
  }

  finishLoading() {
    const btn = document.getElementById(this.main.toolByName.open.buttonId);
    const icon = document.querySelector(`#${this.main.toolByName.open.buttonId} > i`);
    if (btn) {
      btn.removeAttribute('disabled');
    }
    if (icon) {
      icon.className = 'ptro-icon ptro-icon-open';
    }
  }

  html() {
    let buttons = '';
    Object.keys(this.pasteOptions).forEach((k) => {
      const o = this.pasteOptions[k];
      o.id = genId();
      buttons += `<button id="${o.id}" class="ptro-selector-btn ptro-color-control">` +
        `<div><i class="ptro-icon ptro-icon-paste_${k}"></i></div>` +
        `<div>${tr(`pasteOptions.${k}`)}</div>` +
      '</button>';
    });
    return `<div class="ptro-paster-select-wrapper" hidden><div class="ptro-paster-select"><div class="ptro-in">${
      buttons
    }</div></div></div>`;
  }
}
