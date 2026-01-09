"use client";
import { useState, useEffect } from "react";

type Entity = "courses" | "products" | "users";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Entity>("courses");
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ show: boolean, id: number | null }>({ show: false, id: null });

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: "", level: "", duration: "",  // Courses
    name: "", price: "", stock: "",      // Products
    username: "", email: ""               // Users
  });

  const fetchData = async () => {
    const res = await fetch(`/api/${activeTab}`);
    const data = await res.json();
    setItems(data.data || []);
  };

  useEffect(() => { 
    fetchData(); 
    cancelEdit(); // Resetear al cambiar de pestaña
  }, [activeTab]);

  // --- FUNCIÓN PARA CARGAR DATOS EN EL FORMULARIO (UPDATE) ---
  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...formData, ...item }); // Rellena el form con los datos actuales
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", level: "", duration: "", name: "", price: "", stock: "", username: "", email: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/${activeTab}/${editingId}` : `/api/${activeTab}`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      fetchData();
      cancelEdit();
      alert(editingId ? "Actualizado correctamente" : "Creado correctamente");
    }
  };

  const deleteRecord = async () => {
    if (!showConfirm.id) return;
    await fetch(`/api/${activeTab}/${showConfirm.id}`, { method: "DELETE" });
    fetchData();
    setShowConfirm({ show: false, id: null });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-800">
      
      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirm.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold">¿Eliminar registro?</h3>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setShowConfirm({show:false, id:null})} className="flex-1 py-2 bg-gray-200 rounded-xl font-bold">No</button>
              <button onClick={deleteRecord} className="flex-1 py-2 bg-red-500 text-white rounded-xl font-bold">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-indigo-600">API MANAGER</h1>
          <nav className="flex bg-white rounded-xl p-1 shadow-sm border">
            {["courses", "products", "users"].map((t) => (
              <button key={t} onClick={() => setActiveTab(t as Entity)} 
                className={`px-6 py-2 rounded-lg font-bold capitalize transition ${activeTab === t ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
                {t}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* FORMULARIO DE ACCIÓN */}
          <div className={`bg-white p-6 rounded-3xl shadow-lg border-t-4 ${editingId ? "border-orange-500" : "border-indigo-500"}`}>
            <h2 className="text-lg font-bold mb-6 italic">{editingId ? "Editando Registro..." : "Crear Nuevo"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "courses" && (
                <>
                  <input placeholder="Título" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  <input placeholder="Nivel" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} />
                  <input placeholder="Horas" type="number" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </>
              )}
              {activeTab === "products" && (
                <>
                  <input placeholder="Nombre" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input placeholder="Precio" type="number" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  <input placeholder="Stock" type="number" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </>
              )}
              {activeTab === "users" && (
                <>
                  <input placeholder="Username" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  <input placeholder="Email" type="email" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </>
              )}

              <div className="flex flex-col gap-2 pt-4">
                <button type="submit" className={`py-3 rounded-xl font-bold text-white ${editingId ? "bg-orange-500" : "bg-indigo-600"}`}>
                  {editingId ? "ACTUALIZAR" : "GUARDAR"}
                </button>
                {editingId && <button onClick={cancelEdit} type="button" className="text-sm font-bold text-slate-400">Cancelar edición</button>}
              </div>
            </form>
          </div>

          {/* LISTA CON BOTONES DE ACTUALIZACIÓN */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6">
            <h2 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-6">Registros en Base de Datos</h2>
            <div className="space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-200 transition">
                  <div>
                    <p className="font-bold text-slate-700">{item.title || item.name || item.username}</p>
                    <p className="text-xs text-slate-400">ID: #{item.id}</p>
                  </div>
                  <div className="flex gap-2">
                    {/* BOTÓN ACTUALIZAR */}
                    <button onClick={() => handleEditClick(item)} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition">
                      EDITAR
                    </button>
                    {/* BOTÓN ELIMINAR */}
                    <button onClick={() => setShowConfirm({show: true, id: item.id})} className="px-4 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition">
                      BORRAR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}