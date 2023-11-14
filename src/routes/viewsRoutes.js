import { Router } from "express";
import { productsManager } from "../service/productsManager.js";
import { messageManager } from "../service/messageManager.js";
import { cartManager } from "../service/cartsManager.js";
import passport from "passport";
import { isUser, isAdmin } from "../middlewares/autMiddleware.js";

const cartsManager = new cartManager();
const messagesManager = new messageManager();
const productManager = new productsManager();

const router = Router();

router.get("/", async (req, res) => {
  const products = await productManager.getAllproduct();
  res.render("home", { products });
});

router.get("/realtimeproducts", async (req, res) => {
  const products = await productManager.getAllproduct();
  res.render("product/realTimeProducts", { products });
});

router.get("/chat", isUser, async (req, res) => {
  const messages = await messagesManager.getAllMessage();
  res.render("chat", { messages });
});

router.get("/cart/:cartId", async (req, res) => {
  const cartId = req.params.cartId;

  const cart = await cartsManager.getCartById(cartId);

  res.render("cart/cart", { cart });
});

router.get("/products", async (req, res) => {
  try {
    const { first_name, last_name } = req.session;
    const user = req.user;
    if (!req.session.cartId) {
      const newCart = await cartsManager.createCart();
      req.session.cartId = newCart._id;
    }

    const page = req.query.page || 1;
    const limit = 6;

    const productsResult = await productManager.getPaginatedProducts(
      page,
      limit
    );
    const products = productsResult.docs;
    const totalPages = productsResult.totalPages;

    res.render("product/products", {
      user,
      products,
      totalPages,
      currentPage: page,
      first_name,
      last_name,
      rol: req.session.rol,
    });
  } catch (error) {
    console.error("Error al obtener productos paginados:", error);
    res.status(500).send("Error al obtener productos");
  }
});

router.get("/addproduct", isAdmin, async (req, res) => {
  try {
    const products = await productManager.getAllproduct();
    res.render("product/addProducts", { products });
  } catch (error) {
    console.error(
      "Error al renderizar la vista de agregar o modificar productos:",
      error
    );
    res
      .status(500)
      .send("Error al renderizar la vista de agregar o modificar productos");
  }
});

router.get("/productDetails/:prodId", async (req, res) => {
  try {
    const productId = req.params.prodId;
    const product = await productManager.getProductById(productId);
    res.render("product/productDetails", { product });
  } catch (error) {
    console.log("Error al ver los detalles del producto", error);
    res.status(500).send("Error al renderizar la vista productDetails");
  }
});

router.get("/modifyProduct", isAdmin, async (req, res) => {
  try {
    const allProducts = await productManager.getAllproduct();
    res.render("product/modifyProduct", { allProducts });
  } catch (error) {
    console.log("Error al obtener todos los productos", error);
    res.status(500).send("Error al renderizar la vista modifyProduct");
  }
});

router.get("/profile", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const user = req.user;
      const userProfile = await cartsManager.getUserProfile(user);
      const cartId = user.cart._id;

      return res.render("user/profile", { user: userProfile, cartId });
    }

    if (req.session && req.session.email) {
      const userProfile = await cartsManager.getUserProfile(req.session);
      const cartId = user.cart._id;

      return res.render("user/profile", { user: userProfile, cartId });
    }

    return res.redirect("/login");
  } catch (error) {
    console.error("Error al renderizar el perfil:", error);
    res.status(500).send("Error al renderizar el perfil");
  }
});

router.get("/signup", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/login");
  }

  res.render("auth/signup");
});

router.get("/login", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/products");
  }
  res.render("auth/login");
});

router.get("/recover", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/products");
  }
  res.render("auth/recover");
});

router.get("/failregister", (req, res) => res.send("Fallo en registro"));

router.get("/faillogin", (req, res) => res.send("Fallo en login"));

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/api/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    req.session.first_name = req.user.first_name;
    req.session.last_name = req.user.last_name;
    req.session.email = req.user.email;
    req.session.age = req.user.age;

    if (req.user.cart) {
      req.session.cartId = req.user.cart;
    }
    req.session.isLogged = true;
    res.redirect("/profile");
  }
);
export default router;
