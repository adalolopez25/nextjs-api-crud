"use client";
import { useState, useEffect } from "react";

type Entity = "courses" | "products" | "users";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Entity>("courses");
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ show: boolean, id: number | null }>({ show: false, id: null });

  const [formData, setFormData] = useState({
    title: "", level: "", duration: "", 
    name: "", price: "", stock: "",     
    username: "", email: ""              
  });

  // 1. OBTENER DATOS (GET)
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/${activeTab}`);
      const result = await res.json();
      setItems(result.data || []);
    } catch (err) { console.error("Error al cargar:", err); }
  };

  useEffect(() => { 
    fetchData(); 
    cancelEdit(); 
  }, [activeTab]);

  // 2. PREPARAR ACTUALIZACIÓN
  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...formData, ...item });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", level: "", duration: "", name: "", price: "", stock: "", username: "", email: "" });
  };

  // 3. ENVIAR DATOS (POST o PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    
    // Si editamos, la URL debe incluir el ID: /api/courses/1
    // Si creamos, la URL es la base: /api/courses
    const url = editingId ? `/api/${activeTab}/${editingId}` : `/api/${activeTab}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        fetchData();
        cancelEdit();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) { alert("Error de conexión"); }
  };

  // 4. ELIMINAR (DELETE)
  const deleteRecord = async () => {
    if (!showConfirm.id) return;
    try {
      const res = await fetch(`/api/${activeTab}/${showConfirm.id}`, { 
        method: "DELETE" 
      });
      const result = await res.json();
      
      if (res.ok) {
        fetchData();
        setShowConfirm({ show: false, id: null });
      } else {
        alert(result.message);
      }
    } catch (err) { alert("Error al eliminar"); }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      
      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirm.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold">¿Eliminar este {activeTab.slice(0,-1)}?</h3>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setShowConfirm({show:false, id:null})} className="flex-1 py-2 bg-gray-200 rounded-xl font-bold">No</button>
              <button onClick={deleteRecord} className="flex-1 py-2 bg-red-500 text-white rounded-xl font-bold">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-indigo-600">DASHBOARD API</h1>
          <div className="flex bg-white rounded-xl p-1 shadow-sm border">
            {(["courses", "products", "users"] as Entity[]).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} 
                className={`px-6 py-2 rounded-lg font-bold capitalize transition ${activeTab === t ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-indigo-400"}`}>
                {t}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULARIO DINÁMICO */}
          <div className={`bg-white p-6 rounded-3xl shadow-lg border-t-8 transition-all ${editingId ? "border-amber-500" : "border-indigo-500"}`}>
            <h2 className="text-lg font-bold mb-6 italic text-slate-500">
              {editingId ? "Actualizando Registro" : "Nuevo Registro"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "courses" && (
                <>
                  <input placeholder="Título" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  <input placeholder="Nivel" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} />
                  <input placeholder="Horas" type="number" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </>
              )}
              {activeTab === "products" && (
                <>
                  <input placeholder="Nombre" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input placeholder="Precio" type="number" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  <input placeholder="Stock" type="number" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </>
              )}
              {activeTab === "users" && (
                <>
                  <input placeholder="Username" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  <input placeholder="Email" type="email" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </>
              )}

              <button type="submit" className={`w-full py-4 rounded-2xl font-black text-white transition ${editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                {editingId ? "GUARDAR CAMBIOS" : "CREAR AHORA"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="w-full text-center text-sm font-bold text-slate-400">
                  Cancelar Edición
                </button>
              )}
            </form>
          </div>

          {/* LISTADO DE ITEMS */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg overflow-hidden border">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
              <span className="font-bold text-slate-400 text-sm tracking-widest uppercase">Base de datos: {activeTab}</span>
              <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">{items.length} registros</span>
            </div>
            <div className="p-2">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-800">{item.title || item.name || item.username}</h3>
                    <p className="text-xs text-slate-400 font-mono">UUID: {item.id}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEditClick(item)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setShowConfirm({show:true, id: item.id})} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-10 text-center text-slate-300 italic">No se encontraron registros.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}