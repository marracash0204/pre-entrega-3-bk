import { userModel } from "../models/userModel.js";
import { cartManager } from "../service/cartsManager.js";
import { Router } from "express";
import passport from "passport";
import bcrypt from "bcrypt";

const cartsManager = new cartManager();
const router = Router();

router.post(
  "/signup",
  passport.authenticate("register", { failureRedirect: "/failregister" }),
  async (req, res) => {
    const newUser = req.user;
    const newCart = await cartsManager.createCart();
    newUser.cart = newCart._id;
    await newUser.save();
    req.session.cartId = newCart._id;

    res.redirect("/login");
  }
);

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/login" }),
  async (req, res) => {
    if (!req.user) {
      res.status(400).send();
    }

    req.session.rol =
      req.user.email === "adminCoder@coder.com" ? "admin" : "usuario";
    req.session.user = {
      first_name: req.user.nombre,
      last_name: req.user.apellido,
      email: req.user.email,
      age: req.user.edad,
      cart: req.user.cart,
    };

    req.session.cartId = req.user.cart;
    req.session.isLogged = true;

    res.redirect("/profile");
  }
);

router.post("/recover", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).populate("cart.carts").lean();

  if (!user) {
    return res.send(
      "Si tu correo existe en nuestros registros, recibiras un mail con la información para recuperar tu contraseña"
    );
  }

  user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  await userModel.updateOne({ email }, user);

  res.redirect("/login");
});
export default router;
