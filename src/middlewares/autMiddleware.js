export const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol === "admin") {
    return next();
  } else {
    res
      .status(403)
      .send(
        "Acceso prohibido. Solo los administradores pueden realizar esta acción."
      );
  }
};

export const isUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol === "usuario") {
    return next();
  } else {
    res
      .status(403)
      .send("Acceso prohibido. Solo los usuarios pueden realizar esta acción.");
  }
};
