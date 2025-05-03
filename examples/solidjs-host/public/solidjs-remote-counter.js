import { delegateEvents as o, template as i, insert as l } from "solid-js/web";
import { createSignal as u } from "solid-js";
var a = /* @__PURE__ */ i("<button>This is a remote count: ");
function m() {
  const [e, r] = u(0);
  return (() => {
    var t = a();
    return t.firstChild, t.$$click = () => r((n) => n + 1), l(t, e, null), t;
  })();
}
o(["click"]);
export {
  m as default
};
