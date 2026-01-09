import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { Course } from "@/types/course";

const filePath = path.join(process.cwd(), "data", "courses.json");

// Helper para leer (con manejo de error si el archivo no existe)
function readCourses(): Course[] {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return []; // Retorna array vacío si hay error al leer
  }
}

// Helper para guardar
function saveCourses(courses: Course[]) {
  fs.writeFileSync(filePath, JSON.stringify(courses, null, 2));
}

// --- MÉTODO PUT (ACTUALIZAR) ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } } // Correcto: 2do argumento
) {
  try {
    const id = Number(params.id);
    const body = await request.json();

    const courses = readCourses();
    // Forzamos Number(c.id) por si en el JSON se guardó como string
    const index = courses.findIndex((c) => Number(c.id) === id);

    if (index === -1) {
      return NextResponse.json(
        { message: `Curso con ID ${id} no encontrado` },
        { status: 404 }
      );
    }

    const updatedCourse = {
      ...courses[index],
      ...body,
      id: id, // El ID de la URL siempre manda
    };

    courses[index] = updatedCourse;
    saveCourses(courses);

    return NextResponse.json({
      message: "Curso actualizado con éxito",
      data: updatedCourse,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al procesar la actualización" },
      { status: 400 }
    );
  }
}

// --- MÉTODO DELETE (ELIMINAR) ---
export async function DELETE(
  request: Request, // Aunque no lo uses, debe ser el 1er parámetro
  { params }: { params: { id: string } } // Los params son el 2do
) {
  try {
    const id = Number(params.id);
    const courses = readCourses();

    // Verificamos si existe antes de filtrar
    const courseExists = courses.some((c) => Number(c.id) === id);

    if (!courseExists) {
      return NextResponse.json(
        { message: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const filteredCourses = courses.filter((c) => Number(c.id) !== id);
    saveCourses(filteredCourses);

    return NextResponse.json({ 
      message: "Curso eliminado con éxito" 
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al eliminar el curso" },
      { status: 500 }
    );
  }
}