const locationPath = location.pathname;
const repo = "/Vue-lesson4-components/";

const path = {
  local: {
    home: ["/", "/index.html"],
    product: "/product.html",
  },
  server: {
    home: [repo, `${repo}index.html`],
    product: `${repo}product.html`,
  },
};

console.log(path);
if (
  locationPath === path.local.home[0] ||
  locationPath === path.local.home[1] ||
  locationPath === path.server.home[0] ||
  locationPath === path.server.home[1]
) {
  import("./src/assets/components/login.js");
} else if (
  locationPath === path.local.product ||
  locationPath === path.server.product
) {
  import("./src/assets/components/products.js");
}
