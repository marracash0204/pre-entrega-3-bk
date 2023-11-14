import { Router } from "express";
import { cartManager } from "../service/cartsManager.js";
import { ticketManager } from "../service/ticketManager.js";
import { productsManager } from "../service/productsManager.js";
import { isAdmin } from "../middlewares/autMiddleware.js";
import emailService from "../service/emailService.js";

const cartsManager = new cartManager();
const productManager = new productsManager();

const router = Router();

router.post("/addproduct", isAdmin, async (req, res) => {
  try {
    const { title, description, price, code, stock } = req.body;

    if (!title || !price || !code || !stock) {
      return res.send("Ingresa un producto válido");
    }

    const product = await productManager.addProduct(
      title,
      description,
      price,
      code,
      stock
    );

    const productId = product.id;
    res.redirect(`/productDetails/${productId}`);
  } catch (error) {
    console.error("Error al agregar o modificar un producto:", error);
    res.status(500).send("Error al agregar o modificar un producto");
  }
});

router.post("/add-to-cart/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const cartId = req.session.cartId;

    if (!cartId) {
      const newCart = await cartsManager.createCart();
      req.session.cartId = newCart._id;
    } else {
      const existingCart = await cartsManager.getCartById(cartId);

      if (!existingCart) {
        console.log("No se encontró un carrito existente");

        const newCart = await cartsManager.createCart();
        req.session.cartId = newCart._id;
      }
    }

    const cartAdd = await cartsManager.addProductToCart(
      req.session.cartId,
      productId
    );
    if (cartAdd !== null) {
      return res.redirect("/products");
    } else {
      res.render("error", { error: "El producto no tiene stock disponible." });
    }
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    return res.status(500).send("Error al agregar producto al carrito");
  }
});

router.post("/cart/:cid/purchase", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const purchaser = req.user.email;
    const cart = await cartsManager.getCartById(cartId);

    if (!cart || !cart.products || cart.products.length === 0) {
      res.render("error", {
        noProducts: true,
        error:
          "No fue posible hacer su ticket, no hay productos agregados al carrito",
      });
    }

    const ticketResult = await ticketManager.generateTicket(cartId, purchaser);

    if (ticketResult !== null) {
      const purchaserEmail = req.user.email;
      await emailService.sendPurchaseConfirmation(
        purchaserEmail,
        ticketResult.purchaser,
        cart.products
      );

      res.render("ticket", { result: ticketResult, purchaser: purchaser });
    } else {
      res.render("ticket", {
        result: "Compra finalizada pero no se pudo generar el ticket",
      });
    }
  } catch (error) {
    console.error("Error al finalizar la compra:", error);
    res.status(500).render("error", { error: "Error al finalizar la compra" });
  }
});

router.post("/delete-product/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const cartId = req.session.cartId;

    if (!cartId) {
      return res.status(400).send("No se encontró el carrito");
    }

    try {
      const result = await cartsManager.deleteProductFromCart(
        cartId,
        productId
      );

      if (result && result.noProducts) {
        return res.render("error", { noProductsToDelete: true });
      }

      return res.redirect("/products");
    } catch (error) {
      console.error("Error al eliminar producto del carrito:", error);

      if (error.message === "Producto no existe en el carrito") {
        return res.render("error", { noProductsToDelete: true });
      }

      return res.status(500).send("Error al eliminar producto del carrito");
    }
  } catch (error) {
    console.error("Error general al eliminar producto del carrito:", error);
    return res
      .status(500)
      .send("Error general al eliminar producto del carrito");
  }
});

router.post("/modify-product/:prodId", isAdmin, async (req, res) => {
  try {
    const productId = req.params.prodId;
    const { title, description, price, code, stock } = req.body;

    const result = await productManager.updateProduct(
      productId,
      title,
      description,
      price,
      code,
      stock
    );

    if (result.success) {
      res.redirect(`/productDetails/${productId}`);
    } else {
      res.status(404).send(result.message);
    }
  } catch (error) {
    console.error("Error al modificar un producto:", error);
    res.status(500).send("Error al modificar un producto");
  }
});

router.post("/delete-product-stock/:prodId", isAdmin, async (req, res) => {
  try {
    const productId = req.params.prodId;
    const result = await productManager.deleteProduct(productId);

    if (result.success) {
      res.redirect("/modifyProduct");
    } else {
      res.status(404).send(result.message);
    }
  } catch (error) {
    console.error("Error al eliminar un producto:", error);
    res.status(500).send("Error al eliminar un producto");
  }
});

router.post("/logout", async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error("Error al destruir la sesión:", err);
        return res.status(500).send("Error al cerrar sesión");
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("Error al destruir la sesión:", err);
          return res.status(500).send("Error al cerrar sesión");
        }

        res.redirect("/login");
      });
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).send("Error al cerrar sesión");
  }
});

export default router;
