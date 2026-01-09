import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

interface Course {
  id: number;
  title: string;
  level: string;
  duration: number;
}

const dataFolder = path.join(process.cwd(), "data");
const filePath = path.join(dataFolder, "courses.json");

function readCourses(): Course[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf-8");
    return data.trim() === "" ? [] : JSON.parse(data);
  } catch (error) { return []; }
}

function saveCourses(courses: Course[]) {
  try {
    if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(courses, null, 2));
  } catch (error) { }
}

// --- PUT ACTUALIZADO PARA NEXT.JS 15 ---
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> } // <-- CAMBIO IMPORTANTE
) {
  try {
    const params = await props.params; // <-- AWAIT NECESARIO
    const id = Number(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido (Debe ser un número)" }, { status: 400 });
    }

    const courses = readCourses();
    const index = courses.findIndex((c) => Number(c.id) === id);

    if (index === -1) {
      return NextResponse.json({ message: `Curso ${id} no encontrado` }, { status: 404 });
    }

    const updatedCourse: Course = {
      ...courses[index],
      ...body,
      id: id,
      duration: body.duration ? Number(body.duration) : courses[index].duration
    };

    courses[index] = updatedCourse;
    saveCourses(courses);

    return NextResponse.json({ message: "Curso actualizado", data: updatedCourse });

  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

// --- DELETE ACTUALIZADO PARA NEXT.JS 15 ---
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> } // <-- CAMBIO IMPORTANTE
) {
  try {
    const params = await props.params; // <-- AWAIT NECESARIO
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const courses = readCourses();
    const exists = courses.some((c) => Number(c.id) === id);

    if (!exists) {
      return NextResponse.json({ message: "Curso no encontrado" }, { status: 404 });
    }

    const filteredCourses = courses.filter((c) => Number(c.id) !== id);
    saveCourses(filteredCourses);

    return NextResponse.json({ message: "Curso eliminado con éxito" });

  } catch (error) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}