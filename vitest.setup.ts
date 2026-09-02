import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// `vi.mock` factories are hoisted above regular top-level code, so a plain
// `const routerPush = vi.fn()` referenced inside the factory below would
// throw ("cannot access before initialization"). `vi.hoisted` runs before
// that hoisting happens, giving the factory a stable reference to close
// over -- the same push/replace the component sees are the ones a test
// asserts on via `useRouter()`.
const { routerPush, routerReplace } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    replace: routerReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Sin `test.globals: true` en vitest.config.ts, el auto-cleanup de
// Testing Library no encuentra un `afterEach` global y no se registra:
// el DOM de un test queda montado para el siguiente. Lo registramos a mano.
afterEach(() => {
  cleanup();
  routerPush.mockClear();
  routerReplace.mockClear();
});

// jsdom no implementa estas APIs que los primitivos de Base UI (shadcn/ui)
// usan para posicionamiento y captura de puntero. Sin esto, Select/Dialog/
// RadioGroup tiran errores "not implemented" al interactuar en los tests.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub);

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
