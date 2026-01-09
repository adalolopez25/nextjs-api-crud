import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Products } from "@/types/products";

const filePath = path.join(process.cwd(), "data", "products.json");

function readProducts(): Products[] {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeProducts(products: Products[]) {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
}

export async function GET() {
  try {
    const products = readProducts();
    return NextResponse.json({
      message: "Solicitud Exitosa",
      data: products,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error al leer productos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, stock } = body;

    // Validación de tipos (importante para que no se guarde basura en el JSON)
    if (!name || typeof price !== "number" || typeof stock !== "number") {
      return NextResponse.json(
        { message: "Datos inválidos (name, price y stock son requeridos)" },
        { status: 400 }
      );
    }

    const products = readProducts();
    const nextID = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const addProduct: Products = { id: nextID, name, price, stock };
    products.push(addProduct);
    writeProducts(products);

    return NextResponse.json({ message: "Producto creado", data: addProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}