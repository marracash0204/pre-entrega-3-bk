class CartDTO {
  constructor(products) {
    this.products = products.map((product) => ({
      product: product.product,
      quantity: product.quantity,
    }));
  }

  static createFromModel(cartModel) {
    return new CartDTO(cartModel.products);
  }
}

export { CartDTO };
