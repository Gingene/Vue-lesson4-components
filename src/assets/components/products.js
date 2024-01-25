import { createApp, computed } from "../../vue/vue.esm-browser.min.js";
import { $http, path } from "../api/config.js";

let addProductModal = null;
let delProductModal = null;

const app = createApp({
  data() {
    return {
      productList: [],
      tempProduct: {
        title: "",
        category: "",
        unit: "",
        origin_price: 0,
        price: 0,
        num: 0,
        rating: 0,
        description: "",
        content: "",
        is_enabled: 1,
        imageUrl: "",
        imagesUrl: [""],
      },
      productModalTitle: "",
      pagination: {},
    };
  },
  methods: {
    async checkAdmin() {
      try {
        await $http.post(path.check);
        this.getProduct();
      } catch (err) {
        Swal.fire({
          icon: "error",
          text: "請先登入",
        });

        location.href = "index.html";
      }
    },
    async getProduct(page = 1) {
      const res = await $http.get(`${path.admin}/products?page=${page}`);
      this.productList = [...res.data.products];
      this.pagination = { ...res.data.pagination };
    },
    async pageUpdate(page) {
      this.loading("換頁中請稍等");
      await this.getProduct(page);
      this.removeloading();
    },
    resetProduct() {
      this.tempProduct = {
        title: "",
        category: "",
        unit: "",
        origin_price: 0,
        price: 0,
        num: 0,
        rating: 0,
        description: "",
        content: "",
        is_enabled: 1,
        imageUrl: "",
        imagesUrl: [""],
      };
    },
    openModal(title, product) {
      this.productModalTitle = title;

      if (product) {
        this.tempProduct = { ...this.tempProduct, ...product };
      } else {
        this.resetProduct();
      }
      addProductModal.show();
    },
    deleteCheck(product) {
      this.tempProduct = { ...product };
      delProductModal.show();
    },
    loading(msg) {
      this.$refs.loadingDom.classList.remove("d-none");
      this.$refs.loadingDom.childNodes[0].childNodes[0].textContent = msg;
    },
    removeloading() {
      this.$refs.loadingDom.classList.add("d-none");
    },
  },
  provide() {
    return {
      loading: this.loading,
      removeloading: this.removeloading,
    };
  },
  mounted() {
    this.checkAdmin();
  },
});

app.component("pagination-product", {
  template: "#paginationProduct",
  props: ["pagination", "loading", "removeloading"],
  methods: {
    pageNow(newPage) {
      if (typeof newPage === "number") {
        this.$emit("pageUpdate", newPage);
      } else {
        if (newPage.target.innerText === "Previous") {
          this.$emit("pageUpdate", this.pagination.current_page - 1);
        } else {
          this.$emit("pageUpdate", this.pagination.current_page + 1);
        }
      }
    },
  },
});

app.component("product-modal", {
  template: "#productModal",
  props: ["product", "modalTitle"],
  inject: ["loading", "removeloading"],
  methods: {
    async updateProduct() {
      try {
        let url = `${path.admin}/product`;
        let http = "post";

        if (this.modalTitle !== "新增產品") {
          url = `${path.admin}/product/${this.product.id}`;
          http = "put";
        }

        const payload = { data: { ...this.product } };
        console.log(payload);
        if (payload.data.rating > 5 || payload.data.rating < 0) {
          Swal.fire({
            icon: "error",
            text: "請輸入0-5之間的數字",
          });
          return;
        }
        this.loading("儲存中，請稍後");
        const res = await $http[http](url, payload);
        Swal.fire({
          icon: "success",
          text: res.data.message,
        });
        this.$emit("update");
        this.removeloading();
        this.closeModal();
      } catch (err) {
        this.removeloading();
      }
    },
    handleErrorImageUrl() {
      // this.imageError = "錯誤連結";
      // this.tempProduct.imagesUrl = [""];
      console.error("錯誤連結");
    },
    closeModal() {
      addProductModal.hide();
    },
    async imageUpload(e) {
      if (!e.target.files.length) return;
      const formData = new FormData();
      formData.append("file-to-upload", e.target.files[0]);
      const res = await $http.post(`${path.admin}/upload`, formData);
      this.product.imageUrl = res.data.imageUrl;
    },
  },
  mounted() {
    addProductModal = new bootstrap.Modal(this.$refs.productModalDom, {
      keyboard: false,
      backdrop: "static",
    });
  },
});

app.component("del-modal", {
  template: "#delModal",
  props: ["product"],
  inject: ["loading", "removeloading"],
  methods: {
    async deleteProduct() {
      try {
        const { id } = this.product;
        this.loading("刪除產品中，請稍後");
        const res = await $http.delete(`${path.admin}/product/${id}`);
        Swal.fire({
          icon: "success",
          text: res.data.message,
        });
        this.$emit("update");
        this.removeloading();
        delProductModal.hide();
      } catch (err) {
        delProductModal.hide();
      }
    },
  },
  mounted() {
    delProductModal = new bootstrap.Modal(this.$refs.delModalDom);
  },
});

app.mount("#app");
