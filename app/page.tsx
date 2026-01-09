"use client";
import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";

type EntityType = "courses" | "products" | "users";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<EntityType>("courses");
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "", level: "", duration: "",
    name: "", price: "", stock: "",
    username: "", email: ""
  });

  useEffect(() => {
    AOS.init({ duration: 800, once: false });
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/${activeTab}`);
      const result = await res.json();
      setItems(result.data || []);
      setTimeout(() => AOS.refresh(), 100);
    } catch (err) { console.error(err); }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", level: "", duration: "", name: "", price: "", stock: "", username: "", email: "" });
  };

  const notify = (title: string, icon: "success" | "error") => {
    Swal.fire({
      title, icon, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
      background: '#1e293b', color: '#fff'
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingId;
    const url = isEdit ? `/api/${activeTab}/${editingId}` : `/api/${activeTab}`;
    const payload = { ...formData };
    
    if (activeTab === "courses") (payload as any).duration = Number(formData.duration);
    if (activeTab === "products") {
      (payload as any).price = Number(formData.price);
      (payload as any).stock = Number(formData.stock);
    }

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        notify(isEdit ? "¡Actualizado!" : "¡Creado!", "success");
        fetchData();
        cancelEdit();
      }
    } catch (err) { notify("Error de red", "error"); }
  };

  const confirmDelete = (id: number) => {
    Swal.fire({
      title: '¿Eliminar?', icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#6366f1', background: '#0f172a', color: '#f8fafc',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/${activeTab}/${id}`, { method: "DELETE" });
        if (res.ok) { notify("Eliminado", "success"); fetchData(); }
      }
    });
  };

  return (
    <div className="dashboard-wrapper">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6" data-aos="fade-down">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">NEXUS SYSTEM</h1>
            <p className="text-slate-400 font-medium">Dashboard Administrativo Dark</p>
          </div>
          
          <div className="flex bg-slate-900/50 backdrop-blur-md rounded-2xl p-1.5 border border-slate-800 shadow-xl">
            {(["courses", "products", "users"] as EntityType[]).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} 
                className={`tab-button ${activeTab === t ? "tab-button-active" : ""}`}>
                {t}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* FORMULARIO */}
          <div className="lg:col-span-4" data-aos="fade-right">
            <div className="glass-card p-8 sticky top-10">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${editingId ? "bg-amber-400 animate-pulse" : "bg-indigo-600"}`}></span>
                {editingId ? "Editar Registro" : "Nuevo Ingreso"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    
                    {activeTab === "courses" && (
                      <>
                        <div>
                          <label className="label-style">Título</label>
                          <input required className="input-style" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div>
                          <label className="label-style">Nivel</label>
                          <select 
                            required 
                            className="input-style cursor-pointer appearance-none" 
                            value={formData.level} 
                            onChange={e => setFormData({...formData, level: e.target.value})}
                          >
                            <option value="" disabled className="bg-slate-900 text-slate-500">Seleccionar nivel</option>
                            <option value="Básico" className="bg-slate-900">Básico</option>
                            <option value="Intermedio" className="bg-slate-900">Intermedio</option>
                            <option value="Avanzado" className="bg-slate-900">Avanzado</option>
                            <option value="Máster" className="bg-slate-900">Máster</option>
                          </select>
                        </div>
                        <div>
                          <label className="label-style">Horas</label>
                          <input type="number" required className="input-style" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                        </div>
                      </>
                    )}

                    {activeTab === "products" && (
                      <>
                        <div><label className="label-style">Nombre</label><input required className="input-style" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                        <div><label className="label-style">Precio</label><input type="number" required className="input-style" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                        <div><label className="label-style">Stock</label><input type="number" required className="input-style" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
                      </>
                    )}

                    {activeTab === "users" && (
                      <>
                        <div><label className="label-style">Usuario</label><input required className="input-style" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div>
                        <div><label className="label-style">Email</label><input type="email" required className="input-style" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} type="submit" 
                  className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${editingId ? "bg-amber-500" : "bg-indigo-600 shadow-indigo-500/20 shadow-lg"}`}>
                  {editingId ? "ACTUALIZAR" : "GUARDAR REGISTRO"}
                </motion.button>
                
                {editingId && <button type="button" onClick={cancelEdit} className="w-full text-sm font-medium text-slate-500 hover:text-white transition">Cancelar edición</button>}
              </form>
            </div>
          </div>

          {/* LISTADO */}
          <div className="lg:col-span-8" data-aos="fade-left">
            <div className="glass-card overflow-hidden">
              <div className="p-6 bg-slate-800/50 border-b border-slate-800">
                <h3 className="font-bold text-xs uppercase tracking-widest text-indigo-400">Base de datos: {activeTab}</h3>
              </div>
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {items.length > 0 ? items.map((item) => (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.id} className="list-item">
                    <div>
                      <span className="text-[10px] font-black text-indigo-500">ID #{item.id}</span>
                      <h3 className="font-extrabold text-lg text-white">{item.title || item.name || item.username}</h3>
                      {activeTab === 'courses' && <p className="text-xs text-slate-400 font-medium">{item.level} — {item.duration}h</p>}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setEditingId(item.id); setFormData({...formData, ...item}); window.scrollTo({top:0, behavior:'smooth'}) }} className="p-3 bg-slate-700 text-indigo-300 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button onClick={() => confirmDelete(item.id)} className="p-3 bg-slate-700 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="p-20 text-center opacity-50">
                    <p className="font-bold italic">No hay registros disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}