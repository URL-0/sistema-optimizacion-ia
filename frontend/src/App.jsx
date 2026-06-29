import { useState, useEffect } from 'react'

function App() {
  const [productos, setProductos] = useState([])
  const [conectado, setConectado] = useState(false)
  
  const [formulario, setFormulario] = useState({
    codigo_barras: '',
    nombre_producto: '',
    precio_unitario: '',
    stock_actual: '',
    stock_minimo_alerta: ''
  })

  const [venta, setVenta] = useState({
    codigo_barras: '',
    cantidad: ''
  })

  const [productoIaId, setProductoIaId] = useState('') 
  const [prediccion, setPrediccion] = useState(null)   
  const [cargandoIa, setCargandoIa] = useState(false)   

  const cargarProductos = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/productos/')
      if (res.ok) {
        const data = await res.json()
        setProductos(data)
        setConectado(true)
      }
    } catch (error) {
      console.error("Error de enlace con el servidor central:", error)
      setConectado(false)
    }
  }

  const cargarPrediccionIa = async (id) => {
    if (!id) {
      setPrediccion(null)
      return
    }
    setCargandoIa(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/analytics/prediccion/${parseInt(id)}`)
      if (res.ok) {
        const data = await res.json()
        setPrediccion(data) 
      } else {
        setPrediccion(null)
      }
    } catch (error) {
      console.error("Error en la solicitud analítica predictiva:", error)
      setPrediccion(null)
    } finally {
      setCargandoIa(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  useEffect(() => {
    if (productoIaId) {
      cargarPrediccionIa(productoIaId)
    } else {
      setPrediccion(null)
    }
  }, [productoIaId])
  
  const ejecutarSimulacionVenta = async (e) => {
    e.preventDefault()

    if (!venta.codigo_barras || !venta.cantidad) {
      alert("Por favor, seleccione un producto y determine la cantidad correspondiente.")
      return
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/transacciones/venta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_barras: venta.codigo_barras,
          cantidad: parseInt(venta.cantidad),
          tipo_transaccion: 'VENTA'
        })
      })

      if (res.ok) {
        alert("Transacción simulada correctamente. Registro de stock actualizado en inventario.")
        setVenta({ codigo_barras: '', cantidad: '' })
        cargarProductos() 
        if (productoIaId) cargarPrediccionIa(productoIaId)
      } else {
        const errData = await res.json()
        alert(`Error transaccional: ${errData.detail || 'No se pudo procesar la solicitud'}`)
      }
    } catch (error) {
      console.error("Fallo de comunicación del servicio transaccional:", error)
      alert("Error de respuesta por parte del servidor.")
    }
  }

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    })
  }

  const registrarProducto = async (e) => {
    e.preventDefault()
    
    if (!formulario.codigo_barras || !formulario.nombre_producto || !formulario.precio_unitario || !formulario.stock_actual || !formulario.stock_minimo_alerta) {
      alert("Por favor, complete todos los campos requeridos en el formulario.")
      return
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/productos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_barras: formulario.codigo_barras,
          id_categoria: 1,
          nombre_producto: formulario.nombre_producto,
          precio_unitario: parseFloat(formulario.precio_unitario),
          stock_actual: parseInt(formulario.stock_actual),
          stock_minimo_alerta: parseInt(formulario.stock_minimo_alerta)
        })
      })

      if (res.ok) {
        setFormulario({
          codigo_barras: '',
          nombre_producto: '',
          precio_unitario: '',
          stock_actual: '',
          stock_minimo_alerta: ''
        })
        cargarProductos()
      } else {
        const errData = await res.json()
        alert(`Fallo en el registro de datos: ${errData.detail || 'Verifique las especificaciones'}`)
      }
    } catch (error) {
      console.error("Fallo de comunicación del servicio de inventarios:", error)
      alert("No se pudo establecer conexión con el servidor principal.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xs border border-gray-100 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sistema de Optimización de Inventarios</h1>
            <p className="text-gray-500 text-sm">Control transaccional y analítica predictiva con soporte algorítmico</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${conectado ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {conectado ? '🟢 Servidor Activo' : '🔴 Desconectado'}
          </span>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Formulario de Alta de Productos</h2>
          <form onSubmit={registrarProducto} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Código de Barras</label>
              <input type="text" name="codigo_barras" value={formulario.codigo_barras} onChange={manejarCambio} placeholder="Ej: PROD002" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del Producto</label>
              <input type="text" name="nombre_producto" value={formulario.nombre_producto} onChange={manejarCambio} placeholder="Ej: Inka Cola 1L" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Precio Unitario (S/.)</label>
              <input type="number" step="0.01" name="precio_unitario" value={formulario.precio_unitario} onChange={manejarCambio} placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Stock Físico Inicial</label>
              <input type="number" name="stock_actual" value={formulario.stock_actual} onChange={manejarCambio} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Stock Mínimo (Alerta)</label>
              <input type="number" name="stock_minimo_alerta" value={formulario.stock_minimo_alerta} onChange={manejarCambio} placeholder="5" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="md:col-span-5 flex justify-end mt-2">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors shadow-xs">
                Registrar Producto
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 mb-8 bg-linear-to-r from-white to-slate-50/50">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Módulo de Simulación Transaccional</h2>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-sm">OPERATIVO</span>
          </div>
          
          <form onSubmit={ejecutarSimulacionVenta} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Seleccionar Producto</label>
              <select 
                name="codigo_barras" 
                value={venta.codigo_barras} 
                onChange={(e) => setVenta({...venta, codigo_barras: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Seleccione una unidad --</option>
                {productos.map((prod, index) => {
                  const keyUnica = prod.codigo_barras || prod.id_product || index;
                  return (
                    <option key={keyUnica} value={prod.codigo_barras}>
                      {prod.nombre_producto} ({prod.stock_actual} und)
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad para Salida</label>
              <input 
                type="number" 
                min="1"
                placeholder="0" 
                value={venta.cantidad}
                onChange={(e) => setVenta({...venta, cantidad: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" 
              />
            </div>

            <div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors shadow-xs">
                Procesar Salida de Stock
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 mb-8 bg-linear-to-r from-white to-indigo-50/20">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Módulo de Análisis e Inteligencia Predictiva</h2>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-sm">ANALYTICS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cargar Modelo de Predicción</label>
              <select
                value={productoIaId}
                onChange={(e) => setProductoIaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Seleccione una unidad --</option>
                {productos.map((prod) => {
                  const idReal = prod.id_product;
                  return (
                    <option key={idReal} value={idReal}>
                      {prod.nombre_producto} (ID: {idReal})
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="md:col-span-3">
              {cargandoIa ? (
                <div className="text-center py-4 text-sm text-gray-400 animate-pulse">Ejecutando algoritmos analíticos...</div>
              ) : prediccion ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Inventario Disponible</span>
                    <p className="text-xl font-bold text-slate-800 mt-1">{prediccion.stock_actual} und.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tasa de Consumo</span>
                    <p className="text-xl font-bold text-amber-600 mt-1">{prediccion.velocidad_diaria} und/día</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Autonomía Almacén</span>
                      <p className="text-xl font-bold text-indigo-600 mt-1">{prediccion.dias_restantes} días</p>
                    </div>
                    <span className={`inline-block text-center mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      prediccion.alerta === 'ESTABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {prediccion.alerta}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm italic py-4 text-center border border-dashed border-gray-200 rounded-xl bg-slate-50/50">
                  Seleccione un producto para proyectar las métricas de abastecimiento logístico.
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-slate-800">Registros Almacenados (Base de Datos MySQL)</h2>
          </div>

          {productos.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No se registran datos disponibles en el inventario actual.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                    <th className="p-4 pl-6 text-center">ID</th>
                    <th className="p-4">Código único</th>
                    <th className="p-4">Descripción del ítem</th>
                    <th className="p-4">Valoración</th>
                    <th className="p-4 text-center">Existencias</th>
                    <th className="p-4 text-center">Condición de Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-slate-700">
                  {productos.map((prod) => {
                    const esCritico = prod.stock_actual <= prod.stock_minimo_alerta;
                    const idReal = prod.id_product; 
                    return (
                      <tr key={idReal} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-400 text-center">{idReal}</td>
                        <td className="p-4 text-gray-400 font-mono text-xs">{prod.codigo_barras}</td>
                        <td className="p-4 font-semibold text-slate-900">{prod.nombre_producto}</td>
                        <td className="p-4 font-medium text-slate-600">S/. {parseFloat(prod.precio_unitario).toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-lg font-semibold text-xs ${esCritico ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'}`}>
                            {prod.stock_actual} unidades
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${esCritico ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                            {esCritico ? '!! STOCK CRÍTICO' : 'ÓPTIMO'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}

export default App