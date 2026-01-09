import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFolder = path.join(process.cwd(), "data");
const filePath = path.join(dataFolder, "products.json");

function readProducts() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf-8");
  return data.trim() === "" ? [] : JSON.parse(data);
}

function saveProducts(products: any[]) {
  if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const body = await request.json();
    const products = readProducts();
    const index = products.findIndex((p: any) => Number(p.id) === id);

    if (index === -1) return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });

    products[index] = { 
      ...products[index], 
      ...body, 
      id, 
      price: Number(body.price), 
      stock: Number(body.stock) 
    };
    
    saveProducts(products);
    return NextResponse.json({ message: "Producto actualizado", data: products[index] });
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const products = readProducts();
    const filtered = products.filter((p: any) => Number(p.id) !== id);

    if (filtered.length === products.length) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    saveProducts(filtered);
    return NextResponse.json({ message: "Producto eliminado" });
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}