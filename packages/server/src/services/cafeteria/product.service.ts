import { Transaction } from "sequelize";
import { ProductCreationDTO, ProductUpdateDTO } from "@economic-control/shared";
import { ProductModel, ProductAttributes, ProductSearchData } from "@models/cafeteria/product.model.js";

/**
 * Crea un nuevo producto en el catálogo.
 */
async function create(dto: ProductCreationDTO, t?: Transaction): Promise<ProductAttributes> {
    const newProduct = await ProductModel.create(
        {
            ...dto,
            created_at: new Date()
        }, 
        { transaction: t }
    );
    return newProduct.get({ plain: true });
}

/**
 * Obtiene todos los productos. Permite filtrar por estado activo/inactivo.
 */
async function getAll(filters?: ProductSearchData): Promise<ProductAttributes[]> {
    const products = await ProductModel.findAll({
        where: filters ? { ...filters } : undefined,
        order: [["name", "ASC"]],
    });

    return products.map((product) => product.get({ plain: true }));
}

/**
 * Obtiene un producto específico por su ID.
 */
async function getOne(id: number, t?: Transaction): Promise<ProductAttributes> {
    const product = await ProductModel.findByPk(id, { transaction: t });

    if (!product) {
        throw new Error("Producto no encontrado");
    }

    return product.get({ plain: true });
}

/**
 * Actualiza la información de un producto.
 */
async function update(id: number, dto: ProductUpdateDTO, t?: Transaction): Promise<ProductAttributes> {
    const [updatedCount] = await ProductModel.update(dto, {
        where: { id },
        transaction: t,
    });

    if (updatedCount === 0) {
        throw new Error("Producto no encontrado para actualizar");
    }

    const updatedProduct = await ProductModel.findByPk(id, { transaction: t });
    
    if (!updatedProduct) {
        throw new Error("Error al recuperar el producto actualizado");
    }

    return updatedProduct.get({ plain: true });
}

/**
 * Realiza un borrado lógico del producto (lo desactiva) para no romper el historial de ventas.
 */
async function remove(id: number, t?: Transaction): Promise<boolean> {
    const [updatedCount] = await ProductModel.update(
        { is_active: false },
        { where: { id }, transaction: t }
    );

    if (updatedCount === 0) {
        throw new Error("Producto no encontrado");
    }

    return updatedCount > 0;
}

export const productService = {
    create,
    getAll,
    getOne,
    update,
    remove,
};