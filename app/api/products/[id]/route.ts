import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Products } from "@/types/products";

const filePath = path.join(process.cwd(), "data", "products.json");

function readProducts(): Products[] {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveProducts(products: Products[]) {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await props.params; // Next.js 15 await
    const id = Number(idParam);
    const body = await request.json();
    
    const products = readProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    // Actualizamos asegurando que price y stock sean números
    products[index] = { 
      ...products[index], 
      ...body, 
      id, // Protegemos el ID original
      price: body.price !== undefined ? Number(body.price) : products[index].price,
      stock: body.stock !== undefined ? Number(body.stock) : products[index].stock
    };
    
    saveProducts(products);
    return NextResponse.json({ message: "Producto actualizado", data: products[index] });
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await props.params;
    const id = Number(idParam);
    
    const products = readProducts();
    const filtered = products.filter((p) => p.id !== id);

    if (filtered.length === products.length) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    saveProducts(filtered);
    return NextResponse.json({ message: "Producto eliminado" });
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}