import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { User } from "@/types/users";

const pathFile = path.join(process.cwd(), "data", "users.json");

function readUsers(): User[] {
  const data = fs.readFileSync(pathFile, "utf-8");
  return JSON.parse(data);
}

function saveUsers(users: User[]) {
  fs.writeFileSync(pathFile, JSON.stringify(users, null, 2));
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await props.params;
    const id = Number(idParam);
    const body = await request.json();
    
    const users = readUsers();
    const index = users.findIndex((u) => Number(u.id) === id);

    if (index === -1) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    // Actualizamos manteniendo el ID original
    const updatedUser: User = { ...users[index], ...body, id };
    users[index] = updatedUser;
    
    saveUsers(users);

    return NextResponse.json({ message: "Usuario actualizado", data: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: "Error interno al actualizar" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await props.params;
    const id = Number(idParam);
    
    const users = readUsers();
    const filtered = users.filter((u) => Number(u.id) !== id);

    if (filtered.length === users.length) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    saveUsers(filtered);
    return NextResponse.json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    return NextResponse.json({ message: "Error interno al eliminar" }, { status: 500 });
  }
}