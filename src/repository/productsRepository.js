import { productsModel } from "../models/productsModel.js";
import { ProductDTO } from "../dto/productsDto.js";

export class productsRepo {
  mapToDTO(productModel) {
    return new ProductDTO(
      productModel._id,
      productModel.title,
      productModel.description,
      productModel.price,
      productModel.code,
      productModel.stock
    );
  }

  async getAllProductRepo() {
    try {
      const products = await productsModel.find().lean();
      return products.map((product) => this.mapToDTO(product));
    } catch (error) {
      console.error("Error en getAllProductRepo:", error);
      throw error;
    }
  }

  async getAvailableStockRepo(productId) {
    try {
      const product = await productsModel.findById(productId).lean();

      if (!product) {
        throw new Error(`No se encontró un producto con ID: ${productId}`);
      }

      return product.stock;
    } catch (error) {
      console.error("Error en getAvailableStockRepo:", error);
      throw error;
    }
  }

  async updateStockRepo(productId, quantity) {
    try {
      const updatedProduct = await productsModel
        .findByIdAndUpdate(
          productId,
          { $inc: { stock: -quantity } },
          { new: true }
        )
        .lean();

      if (!updatedProduct) {
        throw new Error(`No se encontró un producto con ID: ${productId}`);
      }

      return this.mapToDTO(updatedProduct);
    } catch (error) {
      console.error("Error en updateStockRepo:", error);
      throw error;
    }
  }

  async getProductsNotEnoughStockRepo(products) {
    const productsNotEnoughStock = [];

    for (const product of products) {
      const availableStock = await this.getAvailableStockRepo(
        product.product._id
      );

      if (availableStock < product.quantity) {
        productsNotEnoughStock.push(product.product._id.toString());
      }
    }

    return productsNotEnoughStock;
  }

  async getPaginatedProductsRepo(page, limit) {
    try {
      const options = {
        page,
        limit,
        lean: true,
      };

      const result = await productsModel.paginate({}, options);
      result.docs = result.docs.map((product) => this.mapToDTO(product));
      return result;
    } catch (error) {
      console.error(
        "Error al obtener productos paginados en productRepo:",
        error
      );
      throw error;
    }
  }

  async addProductRepo(title, description, price, code, stock) {
    try {
      const addproduct = await productsModel.create({
        title,
        description,
        price,
        code,
        stock,
      });
      return this.mapToDTO(addproduct);
    } catch (error) {
      console.error("Error en addProductRepo:", error);
      throw error;
    }
  }

  async getProductByIdRepo(id) {
    try {
      const productById = await productsModel.findById(id).lean();

      if (!productById) {
        throw new Error(`No se encontró un producto con ID: ${id}`);
      }

      return this.mapToDTO(productById);
    } catch (error) {
      console.error("Error en getProductByIdRepo:", error);
      throw error;
    }
  }

  async updateProductRepo(id, nTitle, nDescription, nPrice, nCode, nStock) {
    try {
      const updatedProduct = await productsModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              title: nTitle,
              description: nDescription,
              price: nPrice,
              code: nCode,
              stock: nStock,
            },
          },
          { new: true }
        )
        .lean();

      if (!updatedProduct) {
        return {
          success: false,
          message: "No se encontró el producto para actualizar",
        };
      }

      const updatedProductDTO = this.mapToDTO(updatedProduct);

      return { success: true, updatedProduct: updatedProductDTO };
    } catch (error) {
      console.error("Error en updateProductRepo:", error);
      throw error;
    }
  }

  async deleteProductRepo(id) {
    try {
      const deletedProduct = await productsModel.findOneAndDelete({ _id: id });

      if (!deletedProduct) {
        return { success: false, message: "Id inexistente" };
      }

      return { success: true, message: "Producto eliminado correctamente" };
    } catch (error) {
      console.error("Error en deleteProductRepo:", error);
      return { success: false, message: "No se pudo eliminar el producto" };
    }
  }
}
