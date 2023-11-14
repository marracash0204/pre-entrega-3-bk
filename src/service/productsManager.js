import { productsRepo } from "../repository/productsRepository.js";

const productsRepository = new productsRepo();

export class productsManager {
  async getAllproduct() {
    try {
      const products = await productsRepository.getAllProductRepo();
      return products;
    } catch (error) {
      console.error("Error en getAllproduct:", error);
      throw error;
    }
  }

  async getPaginatedProducts(page, limit) {
    try {
      const result = await productsRepository.getPaginatedProductsRepo(
        page,
        limit
      );
      return result;
    } catch (error) {
      console.error("Error al obtener productos paginados:", error);
      throw error;
    }
  }

  async addProduct(title, description, price, code, stock) {
    try {
      const addproduct = await productsRepository.addProductRepo(
        title,
        description,
        price,
        code,
        stock
      );
      return addproduct;
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const productsById = await productsRepository.getProductByIdRepo(id);
      return productsById;
    } catch (error) {
      console.error("Error al obtener el producto por ID:", error);
      throw error;
    }
  }

  async updateProduct(id, nTitle, nDescription, nPrice, nCode, nStock) {
    try {
      const result = await productsRepository.updateProductRepo(
        id,
        nTitle,
        nDescription,
        nPrice,
        nCode,
        nStock
      );
      return result;
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const result = await productsRepository.deleteProductRepo(id);
      return result;
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      throw error;
    }
  }
  async getAvailableStock(productId) {
    return await productsRepository.getAvailableStockRepo(productId);
  }

  async updateStock(productId, quantity) {
    return await productsRepository.updateStockRepo(productId, quantity);
  }

  async getProductsNotEnoughStock(products) {
    return await productsRepository.getProductsNotEnoughStockRepo(products);
  }
}
