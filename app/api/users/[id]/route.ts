import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFolder = path.join(process.cwd(), "data");
const filePath = path.join(dataFolder, "users.json");

function readUsers() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf-8");
  return data.trim() === "" ? [] : JSON.parse(data);
}

function saveUsers(users: any[]) {
  if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const body = await request.json();
    const users = readUsers();
    const index = users.findIndex((u: any) => Number(u.id) === id);

    if (index === -1) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });

    users[index] = { ...users[index], ...body, id };
    saveUsers(users);

    return NextResponse.json({ message: "Usuario actualizado", data: users[index] });
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const users = readUsers();
    const filtered = users.filter((u: any) => Number(u.id) !== id);

    if (filtered.length === users.length) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    saveUsers(filtered);
    return NextResponse.json({ message: "Usuario eliminado" });
  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}