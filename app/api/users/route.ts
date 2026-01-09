import { NextResponse } from "next/server";
import type { User } from "@/types/users";
import fs from "fs";
import path from "path";

// primero se lee el archivo JSON con path.join
const pathFile = path.join(process.cwd(), "data", "users.json");

function readuser(): User[] {
  const data = fs.readFileSync(pathFile, "utf-8");
  return JSON.parse(data);
}

function saveUser(user: User[]) {
  fs.writeFileSync(pathFile, JSON.stringify(user, null, 2));
}

export function GET() {
  const users = readuser();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "Error leve" }, { status: 400 });
    }
    const users = readuser();

    const newUser: User = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      name,
      email,
    };

    users.push(newUser);
    saveUser(users);
    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Error al enviar el body" },
      { status: 400 }
    );
  }
}
