/* orbirive.js — Rive runtime island (@rive-app/canvas).
 *
 * window.OrbiRive.mount(container, { src, artboard, stateMachine, animation, onLoad, onError })
 *   - Instantiates a Rive animation into a <canvas> inside `container`.
 *   - `src` is a URL/path to a .riv file. If it fails to load, onError fires so the
 *     caller can show a placeholder (nothing is drawn).
 * window.OrbiRive.unmount(container)  — clean up.
 *
 * Self-contained: the wasm is served locally (vendor/orbirive/rive.wasm) so the
 * packaged Electron app never reaches out to a CDN (CSP-safe). Rebuild with
 * `npm run build:orbirive` (also copies the wasm).
 */
import { Rive, Fit, Layout, Alignment, RuntimeLoader } from '@rive-app/canvas';

// Point the loader at the locally-shipped wasm rather than the default CDN.
try { RuntimeLoader.setWasmUrl('vendor/orbirive/rive.wasm'); } catch (_) {}

const instances = new WeakMap();

function mount(container, opts = {}) {
  if (!container || !opts.src) return null;
  let canvas = container.querySelector('canvas.orbi-rive-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'orbi-rive-canvas';
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    container.appendChild(canvas);
  }
  try {
    const r = new Rive({
      src: opts.src,
      canvas,
      autoplay: opts.autoplay !== false,
      artboard: opts.artboard,
      stateMachines: opts.stateMachine || opts.stateMachines,
      animations: opts.animation || opts.animations,
      layout: new Layout({ fit: opts.fit || Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => {
        try { r.resizeDrawingSurfaceToCanvas(); } catch (_) {}
        container.dataset.riveReady = '1';
        if (opts.onLoad) { try { opts.onLoad(r); } catch (_) {} }
      },
      onLoadError: (e) => { if (opts.onError) { try { opts.onError(e); } catch (_) {} } },
    });
    instances.set(container, r);
    return r;
  } catch (e) {
    if (opts.onError) { try { opts.onError(e); } catch (_) {} }
    return null;
  }
}

function unmount(container) {
  const r = instances.get(container);
  if (r) { try { r.cleanup(); } catch (_) {} instances.delete(container); }
}

window.OrbiRive = { mount, unmount };
export { mount, unmount };
