import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Products } from "@/types/products";

const filePath = path.join(process.cwd(), "data", "products.json");
function readProducts(): Products[] {
  const readProducts = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(readProducts);
}

function writeProducts(products: Products[]) {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
}

export function GET() {
  try {
    const checkProducts = readProducts();

    if (!checkProducts || checkProducts.length === 0) {
      return NextResponse.json({
        message: "Aun no hay productos en el inventario",
        data: [],
        status: 200,
      });
    }
    return NextResponse.json(
      {
        message: "Solicitud Exitosa",
        count: checkProducts.length,
        data: checkProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({
      message: "Error interno al obtener los productos",
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, stock } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json(
        {
          message: "Faltan datos obligatorios (name, price, stock",
        },
        { status: 400 }
      );
    }

    const products = readProducts();

    const nextID =
      products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const addProduct: Products = {
      id: nextID,
      name,
      price,
      stock,
    };

    products.push(addProduct);
    writeProducts(products);

    return NextResponse.json(
      {
        message: "Producto creado con exito",
        data: addProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error al procesar la solicitud o JSON invalido",
      },
      { status: 400 }
    );
  }
}
