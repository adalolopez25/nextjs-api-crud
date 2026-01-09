import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Course } from "@/types/course";

const pathFile = path.join(process.cwd(), "data", "courses.json");
function readFile(): Course[] {
  const checkedFileCourses = fs.readFileSync(pathFile, "utf-8");
  return JSON.parse(checkedFileCourses);
}

function writeFile(course: Course[]) {
  fs.writeFileSync(pathFile, JSON.stringify(course, null, 2));
}

export async function GET() {
  try {
    const readCourses = readFile();

    if (!readCourses || readCourses.length === 0) {
      return NextResponse.json(
        {
          message: "Aun no hay datos registrados en el sistema",
          data: [],
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "Solicitud Exitosa",
        count: readCourses.length,
        data: readCourses,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno en el servidor o al obtener los cursos" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<Course> = await request.json();
    const { title, level, duration } = body;

 
    if (!title?.trim() || !level?.trim() || typeof duration !== "number") {
      return NextResponse.json(
        {
          message: "Datos inválidos o faltantes (title, level y duration son obligatorios)",
        },
        { status: 400 }
      );
    }

    const courses = readFile();

 
    const maxId = courses.reduce((max, c) => (c.id > max ? c.id : max), 0);
    const newId = maxId + 1;

    const courseToAdd: Course = {
      id: newId,
      title: title.trim(),
      level: level.trim(),
      duration,
    };

    // 4. Persistencia
    courses.push(courseToAdd);
    writeFile(courses);

    return NextResponse.json(
      {
        message: "Curso creado con éxito",
        data: courseToAdd,
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        message: "Error interno en el servidor o JSON inválido",
      },
      { status: 500 }
    );
  }
}