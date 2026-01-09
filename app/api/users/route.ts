import { NextResponse } from "next/server";
import type { User } from "@/types/users";
import fs from "fs";
import path from "path";

const pathFile = path.join(process.cwd(), "data", "users.json");

function readUser(): User[] {
  const data = fs.readFileSync(pathFile, "utf-8");
  return JSON.parse(data);
}

function saveUser(user: User[]) {
  fs.writeFileSync(pathFile, JSON.stringify(user, null, 2));
}

export async function GET() {
  try {
    const users = readUser();
    // Envolvemos en 'data' para que el frontend lo encuentre
    return NextResponse.json({ data: users });
  } catch (error) {
    return NextResponse.json({ message: "Error al leer usuarios", data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Cambié 'name' por 'username' para que coincida con tu Dashboard
    const { username, email } = body;

    if (!username || !email) {
      return NextResponse.json({ message: "Username y Email son obligatorios" }, { status: 400 });
    }
    
    const users = readUser();
    const newUser: User = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      username,
      email,
    };

    users.push(newUser);
    saveUser(users);
    
    return NextResponse.json({ message: "Usuario creado", data: newUser }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error en el cuerpo de la solicitud" }, { status: 400 });
  }
}