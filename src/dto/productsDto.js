class ProductDTO {
  constructor(id, title, description, price, code, stock) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.code = code;
    this.stock = stock;
  }

  static createFromModel(productModel) {
    return new ProductDTO(
      productModel._id,
      productModel.title,
      productModel.description,
      productModel.price,
      productModel.code,
      productModel.stock
    );
  }
}

export { ProductDTO };
